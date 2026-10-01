import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createElectricityReading, getAllElectricityReadings } from '@/lib/electricityStore';

/**
 * IoT Smart Sub-Meter Telemetry API
 * 
 * Hardware devices (ESP32, PZEM-004T, Modbus RTU RS485 Gateways, or Smart Energy Meters)
 * transmit periodic energy telemetry (kWh readings, voltage, current) directly to this endpoint.
 */

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/electricity/telemetry',
    description: 'UniNest IoT Smart Energy Sub-Meter Telemetry Ingest Gateway',
    protocol: 'HTTPS POST / MQTT Bridge',
    supportedMeters: [
      'ESP32 + PZEM-004T (V3.0) Wi-Fi Energy Monitor',
      'Schneider Electric EM6400 (Modbus RS-485 Gateway)',
      'Eastron SDM120 / SDM230 Bi-Directional DIN-Rail Meter',
      'Tuya / Smart Life Zigbee/Wi-Fi Sub-Meter Gateway',
    ],
    samplePayload: {
      meterNo: 'SUB-MTR-204',
      reading: 1312,
      voltage: 231.4,
      current: 2.15,
      power: 497.5,
      frequency: 50.0,
      apiKey: 'uninest_iot_sec_pcte_2026',
    },
    arduinoExampleUrl: '#hardware-wiring-guide',
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const meterNo = String(body.meterNo || body.meter_id || 'SUB-MTR-204').trim();
    const readingKWh = Number(body.reading ?? body.kwh ?? body.totalUnits);

    if (isNaN(readingKWh) || readingKWh <= 0) {
      return NextResponse.json(
        { error: 'Invalid meter reading value. Must provide positive kWh number.' },
        { status: 400 }
      );
    }

    // Optional API key validation for production hardware
    const apiKey = req.headers.get('x-meter-api-key') || body.apiKey;
    const EXPECTED_KEY = process.env.METER_API_KEY || 'uninest_iot_sec_pcte_2026';
    if (apiKey && apiKey !== EXPECTED_KEY) {
      return NextResponse.json({ error: 'Unauthorized meter device key.' }, { status: 401 });
    }

    // Find previous reading to compute delta units
    const allReadings = await getAllElectricityReadings();
    const prevEntry = allReadings.find((r) => r.room.includes('204') || r.id.includes('204'));
    const prevReading = prevEntry ? prevEntry.currentReading : 1245;

    const unitsConsumed = Math.max(0, readingKWh - prevReading);
    const ratePerUnit = 9.5; // PSPCL Punjab State Electricity Regulatory Commission tariff
    const totalRoomBill = Math.round(unitsConsumed * ratePerUnit * 100) / 100;
    const splitPerRoommate = Math.round((totalRoomBill / 2) * 100) / 100;

    // Persist in memory store
    const newRecord = await createElectricityReading({
      property: 'PCTE Smart Student Residency',
      room: `Room 204 (${meterNo})`,
      tenant: 'Rahul Sharma & Aman Verma',
      previousReading: prevReading,
      currentReading: readingKWh,
      ratePerUnit,
      month: new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' }),
    });

    // Also persist in Prisma DB if meter exists
    try {
      const dbMeter = await prisma.electricityMeter.findFirst({
        where: { meterNo },
      });

      if (dbMeter) {
        const dbReading = await prisma.electricityReading.create({
          data: {
            meterId: dbMeter.id,
            reading: Math.round(readingKWh),
            readingDate: new Date(),
          },
        });

        // 50/50 Utility charges for registered tenants
        await prisma.utilityCharge.createMany({
          data: [
            {
              readingId: dbReading.id,
              units: Math.round(unitsConsumed / 2),
              rate: Math.round(ratePerUnit * 100),
              amount: Math.round(splitPerRoommate * 100),
              tenantName: 'Rahul Sharma',
              isPaid: false,
            },
            {
              readingId: dbReading.id,
              units: Math.round(unitsConsumed / 2),
              rate: Math.round(ratePerUnit * 100),
              amount: Math.round(splitPerRoommate * 100),
              tenantName: 'Aman Verma',
              isPaid: true, // Roommate auto-debit
            },
          ],
        });
      }
    } catch {
      // Prisma table optional in demo/dev mode
    }

    return NextResponse.json({
      success: true,
      message: `IoT Sub-Meter telemetry ingested successfully for ${meterNo}.`,
      telemetry: {
        meterNo,
        previousReading: prevReading,
        currentReading: readingKWh,
        unitsConsumed,
        ratePerUnit: `₹${ratePerUnit}/kWh`,
        totalRoomBill: `₹${totalRoomBill}`,
        roommateSplit: {
          sharingType: 'Double Sharing (50/50)',
          perStudentShare: `₹${splitPerRoommate}`,
          occupants: ['Rahul Sharma (Pending)', 'Aman Verma (Paid UPI)'],
        },
        timestamp: new Date().toISOString(),
      },
      readingRecord: newRecord,
    });
  } catch (error: any) {
    console.error('IoT Telemetry Ingestion error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process IoT sub-meter telemetry' },
      { status: 500 }
    );
  }
}
