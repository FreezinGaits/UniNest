import assert from 'node:assert';
import {
  calculateHaversineDistanceKm,
  verifyGpsProximity,
  DEFAULT_GEOFENCE_RADIUS_METERS,
  MAX_GPS_ACCURACY_THRESHOLD_METERS,
} from '../src/lib/proximityEngine';
import { getEscrowStore, findStoreBooking } from '../src/lib/escrowStore';
import { __setMockSessionForTesting } from '../src/lib/auth/actions';
import { POST as verifyArrivalHandler } from '../src/app/api/booking/verify-arrival/route';
import { POST as verifyVisitHandler } from '../src/app/api/booking/verify-visit/route';
import { POST as verifyMoveinHandler } from '../src/app/api/booking/verify-movein/route';
import { POST as visitOtpHandler } from '../src/app/api/booking/visit-otp/route';
import { GET as liveSyncHandler } from '../src/app/api/booking/live-sync/route';
import { NextRequest } from 'next/server';

function createMockRequest(url: string, method: string, body?: any): NextRequest {
  const init: RequestInit = {
    method,
    headers: {
      'content-type': 'application/json',
    },
  };
  if (body) {
    init.body = JSON.stringify(body);
  }
  return new NextRequest(new URL(url, 'http://localhost:3000'), init as any);
}

const STUDENT_SESSION = {
  userId: 'usr-student-demo',
  email: 'rahul@uninest.in',
  name: 'Rahul Sharma',
  role: 'STUDENT' as const,
  expires: new Date(Date.now() + 86400000).toISOString(),
};

const LANDLORD_SESSION = {
  userId: 'usr-landlord-demo',
  email: 'landlord@uninest.in',
  name: 'Vikram Singh',
  role: 'LANDLORD' as const,
  expires: new Date(Date.now() + 86400000).toISOString(),
};

const ATTACKER_SESSION = {
  userId: 'usr-attacker-999',
  email: 'attacker@evil.com',
  name: 'Mallory Malicious',
  role: 'STUDENT' as const,
  expires: new Date(Date.now() + 86400000).toISOString(),
};

// Registered Passi Residency demo location in Ludhiana: 30.8984, 75.8564
const PROPERTY_COORDS = {
  latitude: 30.8984,
  longitude: 75.8564,
};

// Classroom / Remote Location (Model Town, ~8.1 km away): 30.9500, 75.8000
const REMOTE_CLASSROOM_COORDS = {
  latitude: 30.95,
  longitude: 75.8,
  accuracy: 15,
};

// Genuine On-Site Coordinates (~35 meters away from PG reception)
const ONSITE_COORDS = {
  latitude: 30.8986,
  longitude: 75.8565,
  accuracy: 20,
};

async function runSecurityTestSuite() {
  console.log('\n======================================================');
  console.log('🔒 RUNNING UNINEST PROXIMITY & OTP SECURITY TEST SUITE');
  console.log('======================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function runTest(testName: string, fn: () => void | Promise<void>) {
    totalTests++;
    return (async () => {
      try {
        await fn();
        console.log(`  ✓ PASS: ${testName}`);
        passedTests++;
      } catch (err: any) {
        console.error(`  ✗ FAIL: ${testName}`);
        console.error(`    Error: ${err.message}\n`, err.stack);
        throw err;
      }
    })();
  }

  // --------------------------------------------------------------------------
  // TEST GROUP 1: GPS Proximity Engine & Geofencing Math
  // --------------------------------------------------------------------------
  console.log('--- Test Group 1: GPS Proximity Engine & Geofencing Math ---');

  await runTest('Haversine distance calculation is accurate', () => {
    // Distance between known points: (30.8984, 75.8564) and (30.9500, 75.8000)
    const distKm = calculateHaversineDistanceKm(
      PROPERTY_COORDS.latitude,
      PROPERTY_COORDS.longitude,
      REMOTE_CLASSROOM_COORDS.latitude,
      REMOTE_CLASSROOM_COORDS.longitude
    );
    // Expected distance is approximately 7.8 - 8.2 km
    assert(distKm > 7.5 && distKm < 8.5, `Expected ~8 km, got ${distKm} km`);
  });

  await runTest('Rejects out-of-range student sitting in classroom (8 km away)', () => {
    const result = verifyGpsProximity(REMOTE_CLASSROOM_COORDS, PROPERTY_COORDS);
    assert.strictEqual(result.verified, false);
    assert.strictEqual(result.error, 'OUT_OF_RANGE');
    assert(
      (result.distanceMeters ?? 0) > DEFAULT_GEOFENCE_RADIUS_METERS,
      'Distance must exceed 250m geofence radius'
    );
  });

  await runTest('Accepts student on-site within 250m geofence radius', () => {
    const result = verifyGpsProximity(ONSITE_COORDS, PROPERTY_COORDS);
    assert.strictEqual(result.verified, true);
    assert.strictEqual(result.error, undefined);
    assert(
      (result.distanceMeters ?? 999) < DEFAULT_GEOFENCE_RADIUS_METERS,
      'Distance must be within 250m geofence'
    );
  });

  await runTest('Rejects inaccurate GPS signal (> 150m accuracy threshold)', () => {
    const inaccurateCoords = {
      ...ONSITE_COORDS,
      accuracy: 250, // 250m accuracy radius is too loose (could be cell tower triangulation)
    };
    const result = verifyGpsProximity(inaccurateCoords, PROPERTY_COORDS);
    assert.strictEqual(result.verified, false);
    assert.strictEqual(result.error, 'INACCURATE_GPS');
  });

  await runTest('Safely fails when property coordinates are missing (NEVER invents campus centroid)', () => {
    const missingPropCoords = {
      latitude: undefined,
      longitude: null as any,
    };
    const result = verifyGpsProximity(ONSITE_COORDS, missingPropCoords);
    assert.strictEqual(result.verified, false);
    assert.strictEqual(result.error, 'MISSING_PROPERTY_COORDINATES');
  });

  await runTest('Safely rejects invalid coordinate inputs (NaN, out-of-range lat/lng)', () => {
    const invalidCoords = {
      latitude: 145.0, // Invalid latitude (> 90)
      longitude: 75.85,
    };
    const result = verifyGpsProximity(invalidCoords, PROPERTY_COORDS);
    assert.strictEqual(result.verified, false);
    assert.strictEqual(result.error, 'INVALID_USER_COORDINATES');
  });

  // --------------------------------------------------------------------------
  // TEST GROUP 2: Stage 1 Physical Visit Proof OTP Security
  // --------------------------------------------------------------------------
  console.log('\n--- Test Group 2: Stage 1 Physical Visit Proof OTP Security ---');

  await runTest('Prevents students from generating or calling Visit OTP API (403 Forbidden)', async () => {
    await __setMockSessionForTesting(STUDENT_SESSION);
    const req = createMockRequest('/api/booking/visit-otp', 'POST', {
      bookingId: 'bkg-pcte-2026-demo',
    });
    const res = await visitOtpHandler(req);
    assert.strictEqual(res.status, 403, 'Students must not generate landlord visit OTPs');
    const json = await res.json();
    assert.strictEqual(json.success, false);
  });

  await runTest('Allows authorized landlord to generate 4-digit Visit OTP with 72h expiry', async () => {
    await __setMockSessionForTesting(LANDLORD_SESSION);
    const req = createMockRequest('/api/booking/visit-otp', 'POST', {
      bookingId: 'bkg-pcte-2026-demo',
    });
    const res = await visitOtpHandler(req);
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert(/^\d{4}$/.test(json.otp), 'Visit OTP must be a 4-digit numeric code');
    assert(json.expiresAt, 'ExpiresAt timestamp must be provided');
    const expiryTime = new Date(json.expiresAt).getTime();
    assert(expiryTime > Date.now() + 71 * 3600 * 1000, 'Expiry must be approximately 72 hours');
  });

  await runTest('Rejects invalid Visit OTP entered by student (400 Bad Request)', async () => {
    await __setMockSessionForTesting(STUDENT_SESSION);
    const req = createMockRequest('/api/booking/verify-visit', 'POST', {
      bookingId: 'bkg-pcte-2026-demo',
      otp: '0000', // Wrong OTP
    });
    const res = await verifyVisitHandler(req);
    assert.strictEqual(res.status, 400);
    const json = await res.json();
    assert.strictEqual(json.success, false);
    assert(json.message.includes('Invalid') || json.error?.includes('Invalid'));
  });

  await runTest('Rejects expired Visit OTP (> 72 hours)', async () => {
    await __setMockSessionForTesting(STUDENT_SESSION);
    const store = getEscrowStore();
    const booking = store.bookings.find((b) => b.id === 'bkg-pcte-2026-demo');
    if (booking) {
      booking.visitOtp = '1234';
      booking.visitOtpExpiresAt = new Date(Date.now() - 3600 * 1000).toISOString(); // 1 hr ago
    }

    const req = createMockRequest('/api/booking/verify-visit', 'POST', {
      bookingId: 'bkg-pcte-2026-demo',
      otp: '1234',
    });
    const res = await verifyVisitHandler(req);
    assert.strictEqual(res.status, 400);
    const json = await res.json();
    assert.strictEqual(json.success, false);
    assert(json.message.toLowerCase().includes('expired'));
  });

  await runTest('Accepts valid Visit OTP and sets visitVerifiedAt', async () => {
    await __setMockSessionForTesting(STUDENT_SESSION);
    const store = getEscrowStore();
    const booking = store.bookings.find((b) => b.id === 'bkg-pcte-2026-demo');
    if (booking) {
      booking.visitOtp = '8412';
      booking.visitOtpExpiresAt = new Date(Date.now() + 72 * 3600 * 1000).toISOString();
      booking.visitVerifiedAt = null;
    }

    const req = createMockRequest('/api/booking/verify-visit', 'POST', {
      bookingId: 'bkg-pcte-2026-demo',
      otp: '8412',
      decision: 'VERIFY_ONLY',
    });
    const res = await verifyVisitHandler(req);
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert(json.booking.visitVerifiedAt != null, 'visitVerifiedAt must be set');
  });

  await runTest('Prevents replay of already-verified Visit OTP (409 Conflict)', async () => {
    await __setMockSessionForTesting(STUDENT_SESSION);
    const req = createMockRequest('/api/booking/verify-visit', 'POST', {
      bookingId: 'bkg-pcte-2026-demo',
      otp: '8412',
    });
    const res = await verifyVisitHandler(req);
    assert.strictEqual(res.status, 409, 'Replayed visit OTP must return 409 Conflict');
    const json = await res.json();
    assert.strictEqual(json.success, false);
  });

  // --------------------------------------------------------------------------
  // TEST GROUP 3: Stage 2 Physical Arrival & Handshake PIN Vault
  // --------------------------------------------------------------------------
  console.log('\n--- Test Group 3: Stage 2 Physical Arrival & Handshake PIN Vault ---');

  await runTest('Rejects unauthenticated arrival verification request (401 Unauthorized)', async () => {
    await __setMockSessionForTesting(null);
    const req = createMockRequest('/api/booking/verify-arrival', 'POST', {
      bookingId: 'bkg-pcte-2026-demo',
      checklist: { present: true, inspected: true, keysReceived: true },
      method: 'GPS',
      coordinates: ONSITE_COORDS,
    });
    const res = await verifyArrivalHandler(req);
    assert.strictEqual(res.status, 401);
  });

  await runTest('Rejects arrival verification from unauthorized user (403 Forbidden)', async () => {
    await __setMockSessionForTesting(ATTACKER_SESSION);
    const req = createMockRequest('/api/booking/verify-arrival', 'POST', {
      bookingId: 'bkg-pcte-2026-demo',
      checklist: { present: true, inspected: true, keysReceived: true },
      method: 'GPS',
      coordinates: ONSITE_COORDS,
    });
    const res = await verifyArrivalHandler(req);
    assert.strictEqual(res.status, 403);
  });

  await runTest('Rejects arrival verification with incomplete checklist items (400 Bad Request)', async () => {
    await __setMockSessionForTesting(STUDENT_SESSION);
    const req = createMockRequest('/api/booking/verify-arrival', 'POST', {
      bookingId: 'bkg-pcte-2026-demo',
      checklist: { present: true, inspected: true, keysReceived: false }, // unchecked keys
      method: 'GPS',
      coordinates: ONSITE_COORDS,
    });
    const res = await verifyArrivalHandler(req);
    assert.strictEqual(res.status, 400);
    const json = await res.json();
    assert.strictEqual(json.success, false);
    assert(json.error.includes('checklist'));
  });

  await runTest('Rejects arrival verification if Stage 1 Visit OTP was skipped (400 Bad Request)', async () => {
    await __setMockSessionForTesting(STUDENT_SESSION);
    const store = getEscrowStore();
    const booking = store.bookings.find((b) => b.id === 'bkg-pcte-2026-demo');
    if (booking) {
      booking.visitVerifiedAt = null; // simulate student attempting to skip visit OTP
      booking.handshakeStatus = 'PENDING';
      booking.postVisitDecision = null;
    }

    const req = createMockRequest('/api/booking/verify-arrival', 'POST', {
      bookingId: 'bkg-pcte-2026-demo',
      checklist: { present: true, inspected: true, keysReceived: true },
      method: 'GPS',
      coordinates: ONSITE_COORDS,
    });
    const res = await verifyArrivalHandler(req);
    assert.strictEqual(res.status, 400);
    const json = await res.json();
    assert.strictEqual(json.success, false);
    assert(json.error.includes('Stage 1'));
  });

  await runTest('Direct API bypass prevention: Rejects out-of-range GPS submitted to backend (400 Bad Request)', async () => {
    await __setMockSessionForTesting(STUDENT_SESSION);
    const store = getEscrowStore();
    const booking = store.bookings.find((b) => b.id === 'bkg-pcte-2026-demo');
    if (booking) {
      booking.visitVerifiedAt = new Date().toISOString();
      booking.arrivalVerifiedAt = null;
    }

    const req = createMockRequest('/api/booking/verify-arrival', 'POST', {
      bookingId: 'bkg-pcte-2026-demo',
      checklist: { present: true, inspected: true, keysReceived: true },
      method: 'GPS',
      coordinates: REMOTE_CLASSROOM_COORDS, // sitting in classroom
    });
    const res = await verifyArrivalHandler(req);
    assert.strictEqual(res.status, 400, 'Server must enforce geofence distance check');
    const json = await res.json();
    assert.strictEqual(json.success, false);
    assert(json.error === 'OUT_OF_RANGE' || json.message?.includes('geofence'));
  });

  await runTest('Direct API bypass prevention: Rejects inaccurate GPS submitted to backend (400 Bad Request)', async () => {
    await __setMockSessionForTesting(STUDENT_SESSION);
    const req = createMockRequest('/api/booking/verify-arrival', 'POST', {
      bookingId: 'bkg-pcte-2026-demo',
      checklist: { present: true, inspected: true, keysReceived: true },
      method: 'GPS',
      coordinates: { ...ONSITE_COORDS, accuracy: 250 }, // Low accuracy
    });
    const res = await verifyArrivalHandler(req);
    assert.strictEqual(res.status, 400);
    const json = await res.json();
    assert.strictEqual(json.success, false);
    assert(json.error === 'INACCURATE_GPS' || json.message?.includes('inaccurate'));
  });

  await runTest('Rejects invalid Landlord On-Site Fallback Code (400 Bad Request)', async () => {
    await __setMockSessionForTesting(STUDENT_SESSION);
    const req = createMockRequest('/api/booking/verify-arrival', 'POST', {
      bookingId: 'bkg-pcte-2026-demo',
      checklist: { present: true, inspected: true, keysReceived: true },
      method: 'LANDLORD_FALLBACK',
      fallbackCode: '999999', // Invalid fallback code
    });
    const res = await verifyArrivalHandler(req);
    assert.strictEqual(res.status, 400);
    const json = await res.json();
    assert.strictEqual(json.success, false);
    assert(json.error === 'INVALID_FALLBACK_CODE' || json.message?.includes('Fallback'));
  });

  await runTest('Verifies genuine physical arrival via GPS & unlocks 6-digit Move-In Handshake PIN', async () => {
    await __setMockSessionForTesting(STUDENT_SESSION);
    const req = createMockRequest('/api/booking/verify-arrival', 'POST', {
      bookingId: 'bkg-pcte-2026-demo',
      checklist: { present: true, inspected: true, keysReceived: true },
      method: 'GPS',
      coordinates: ONSITE_COORDS,
    });
    const res = await verifyArrivalHandler(req);
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert(/^\d{3}-\d{3}$/.test(json.moveInKey), 'Move-in key must be formatted 6-digit (XXX-XXX)');
    assert(/^\d{6}$/.test(json.rawKey), 'Raw key must be 6 digits');

    // Confirm booking state in store
    const store = getEscrowStore();
    const updated = store.bookings.find((b) => b.id === 'bkg-pcte-2026-demo');
    assert(updated?.arrivalVerifiedAt != null, 'arrivalVerifiedAt must be persisted');
    assert.strictEqual(updated?.arrivalVerificationMethod, 'GPS');
  });

  await runTest('Supports secure Landlord In-Person Fallback check-in for indoor signal loss', async () => {
    await __setMockSessionForTesting(STUDENT_SESSION);
    const store = getEscrowStore();
    const booking = store.bookings.find((b) => b.id === 'bkg-advance-2026-demo');
    if (booking) {
      booking.visitVerifiedAt = new Date().toISOString();
      booking.arrivalVerifiedAt = null;
      booking.arrivalFallbackCode = '742189';
    }

    const req = createMockRequest('/api/booking/verify-arrival', 'POST', {
      bookingId: 'bkg-advance-2026-demo',
      checklist: { present: true, inspected: true, keysReceived: true },
      method: 'LANDLORD_FALLBACK',
      fallbackCode: '742189',
    });
    const res = await verifyArrivalHandler(req);
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert(/^\d{3}-\d{3}$/.test(json.moveInKey));
    const updated = store.bookings.find((b) => b.id === 'bkg-advance-2026-demo');
    assert.strictEqual(updated?.arrivalVerificationMethod, 'LANDLORD_FALLBACK');
  });

  // --------------------------------------------------------------------------
  // TEST GROUP 4: Zero-Knowledge Shielding & Anti-Leakage Verification
  // --------------------------------------------------------------------------
  console.log('\n--- Test Group 4: Zero-Knowledge Shielding & Anti-Leakage Verification ---');

  await runTest('Student live-sync NEVER leaks landlord Visit OTP or fallback code', async () => {
    await __setMockSessionForTesting(STUDENT_SESSION);
    const req = createMockRequest('/api/booking/live-sync?bookingId=bkg-pcte-2026-demo', 'GET');
    const res = await liveSyncHandler(req);
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.booking.visitOtp, undefined, 'visitOtp must be deleted for students');
    assert.strictEqual(
      json.booking.visitOtpExpiresAt,
      undefined,
      'visitOtpExpiresAt must be deleted for students'
    );
    assert.strictEqual(
      json.booking.arrivalFallbackCode,
      undefined,
      'arrivalFallbackCode must be deleted for students'
    );
  });

  await runTest('Student live-sync NEVER leaks Move-In PIN BEFORE arrival verification', async () => {
    await __setMockSessionForTesting(STUDENT_SESSION);
    const store = getEscrowStore();
    const booking = store.bookings.find((b) => b.id === 'bkg-pcte-2026-demo');
    if (booking) {
      booking.arrivalVerifiedAt = null;
      booking.moveInOtp = '482910';
    }

    const req = createMockRequest('/api/booking/live-sync?bookingId=bkg-pcte-2026-demo', 'GET');
    const res = await liveSyncHandler(req);
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(
      json.booking.moveInOtp,
      undefined,
      'moveInOtp must remain shielded before arrival'
    );
  });

  await runTest('Landlord live-sync NEVER leaks student Move-In PIN before physical move-in completed', async () => {
    await __setMockSessionForTesting(LANDLORD_SESSION);
    const store = getEscrowStore();
    const booking = store.bookings.find((b) => b.id === 'bkg-pcte-2026-demo');
    if (booking) {
      booking.arrivalVerifiedAt = new Date().toISOString();
      booking.moveInVerifiedAt = null;
      booking.moveInOtp = '582910';
    }

    const req = createMockRequest('/api/booking/live-sync?bookingId=bkg-pcte-2026-demo', 'GET');
    const res = await liveSyncHandler(req);
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(
      json.booking.moveInOtp,
      undefined,
      'Landlord must NOT see student moveInOtp before student tells it to them'
    );
  });

  // --------------------------------------------------------------------------
  // TEST GROUP 5: Stage 2 Escrow Release Handshake Key & Replay Protection
  // --------------------------------------------------------------------------
  console.log('\n--- Test Group 5: Stage 2 Escrow Release Handshake Key & Replay Protection ---');

  await runTest('Landlord cannot verify move-in before student physical arrival (403 Forbidden)', async () => {
    await __setMockSessionForTesting(LANDLORD_SESSION);
    const store = getEscrowStore();
    const booking = store.bookings.find((b) => b.id === 'bkg-pcte-2026-demo');
    if (booking) {
      booking.arrivalVerifiedAt = null; // Unverified arrival
      booking.moveInVerifiedAt = null;
      booking.moveInOtp = '654321';
    }

    const req = createMockRequest('/api/booking/verify-movein', 'POST', {
      bookingId: 'bkg-pcte-2026-demo',
      moveInKey: '654-321',
    });
    const res = await verifyMoveinHandler(req);
    assert.strictEqual(res.status, 403, 'Must reject move-in when arrival unverified');
    const json = await res.json();
    assert.strictEqual(json.success, false);
  });

  await runTest('Landlord entering wrong move-in key is rejected (400 Bad Request)', async () => {
    await __setMockSessionForTesting(LANDLORD_SESSION);
    const store = getEscrowStore();
    const booking = store.bookings.find((b) => b.id === 'bkg-pcte-2026-demo');
    if (booking) {
      booking.arrivalVerifiedAt = new Date().toISOString();
      booking.moveInVerifiedAt = null;
      booking.moveInOtp = '654321';
    }

    const req = createMockRequest('/api/booking/verify-movein', 'POST', {
      bookingId: 'bkg-pcte-2026-demo',
      moveInKey: '999-999', // Incorrect key
    });
    const res = await verifyMoveinHandler(req);
    assert.strictEqual(res.status, 400);
    const json = await res.json();
    assert.strictEqual(json.success, false);
  });

  await runTest('Landlord entering correct 6-digit key successfully completes move-in and escrow release', async () => {
    await __setMockSessionForTesting(LANDLORD_SESSION);
    const store = getEscrowStore();
    const booking = store.bookings.find((b) => b.id === 'bkg-pcte-2026-demo');
    if (booking) {
      booking.arrivalVerifiedAt = new Date().toISOString();
      booking.moveInVerifiedAt = null;
      booking.moveInOtp = '654321';
      booking.status = 'CONFIRMED';
    }

    const req = createMockRequest('/api/booking/verify-movein', 'POST', {
      bookingId: 'bkg-pcte-2026-demo',
      moveInKey: '654-321',
    });
    const res = await verifyMoveinHandler(req);
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    const updated = store.bookings.find((b) => b.id === 'bkg-pcte-2026-demo');
    assert.strictEqual(updated?.status, 'ACTIVE');
    assert(updated?.moveInVerifiedAt != null);
  });

  await runTest('Replay prevention: Re-submitting move-in key on completed booking is rejected (409 Conflict)', async () => {
    await __setMockSessionForTesting(LANDLORD_SESSION);
    const req = createMockRequest('/api/booking/verify-movein', 'POST', {
      bookingId: 'bkg-pcte-2026-demo',
      moveInKey: '654-321',
    });
    const res = await verifyMoveinHandler(req);
    assert.strictEqual(res.status, 409);
    const json = await res.json();
    assert.strictEqual(json.success, false);
  });

  // --------------------------------------------------------------------------
  // TEST GROUP 6: Concurrency & Race Condition Resilience
  // --------------------------------------------------------------------------
  console.log('\n--- Test Group 6: Concurrency & Race Condition Resilience ---');

  await runTest('Handles concurrent arrival verification requests cleanly without race condition', async () => {
    await __setMockSessionForTesting(STUDENT_SESSION);
    const store = getEscrowStore();
    const booking = store.bookings.find((b) => b.id === 'bkg-advance-2026-demo');
    if (booking) {
      booking.visitVerifiedAt = new Date().toISOString();
      booking.arrivalVerifiedAt = null;
    }

    const requests = Array.from({ length: 5 }, () =>
      verifyArrivalHandler(
        createMockRequest('/api/booking/verify-arrival', 'POST', {
          bookingId: 'bkg-advance-2026-demo',
          checklist: { present: true, inspected: true, keysReceived: true },
          method: 'GPS',
          coordinates: { latitude: 30.9011, longitude: 75.8071, accuracy: 10 },
        })
      )
    );

    const responses = await Promise.all(requests);
    // All requests should return valid HTTP statuses (200 OK or 400/409 duplicate)
    for (const res of responses) {
      assert([200, 400, 409].includes(res.status), `Unexpected status: ${res.status}`);
    }

    // Booking must have a verified arrival timestamp and valid 6-digit moveInOtp
    const updated = store.bookings.find((b) => b.id === 'bkg-advance-2026-demo');
    assert(updated?.arrivalVerifiedAt != null);
    assert(/^\d{6}$/.test(updated?.moveInOtp || ''));
  });

  console.log('\n======================================================');
  console.log(`🎉 ALL ${passedTests}/${totalTests} SECURITY TESTS PASSED SUCCESSFULLY!`);
  console.log('======================================================\n');
}

runSecurityTestSuite().catch((err) => {
  console.error('\n❌ Security test suite failed with error:', err);
  process.exit(1);
});
