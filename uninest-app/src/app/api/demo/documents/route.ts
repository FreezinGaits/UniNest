import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/actions';
import {
  getDocumentsForStudent,
  getDocumentsForLandlord,
  getDocumentsStore,
  addDocument,
  updateDocument,
  archiveDocument,
  DocumentItem,
} from '@/lib/documentsStore';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    const { searchParams } = new URL(request.url);
    const roleParam = searchParams.get('role');

    const effectiveRole = roleParam || session?.role || 'STUDENT';

    let documents: DocumentItem[] = [];
    if (effectiveRole === 'LANDLORD' || effectiveRole === 'ADMIN') {
      documents = getDocumentsForLandlord(session?.email);
    } else {
      documents = getDocumentsForStudent(session?.email);
    }

    return NextResponse.json({
      success: true,
      role: effectiveRole,
      count: documents.length,
      documents,
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch documents', documents: getDocumentsStore() },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    let body: Partial<DocumentItem>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
    }

    if (!body.title) {
      return NextResponse.json({ success: false, error: 'Document title is required' }, { status: 400 });
    }

    const newDoc = addDocument({
      ...body,
      issuer: body.issuer || session?.name || 'Passi Residency Management',
      uploadedByRole: session?.role === 'STUDENT' ? 'STUDENT' : 'LANDLORD',
      isPlatformLocked: false, // user uploads are never platform locked
      sharedWithTenant: body.sharedWithTenant ?? true,
      sharedScope: body.sharedScope || 'ALL_TENANTS',
    });

    return NextResponse.json({
      success: true,
      message: 'Document uploaded and synchronized successfully',
      document: newDoc,
    }, { status: 201 });
  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save document' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    let body: { id: string; patch: Partial<DocumentItem> };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
    }

    if (!body.id) {
      return NextResponse.json({ success: false, error: 'Document ID required' }, { status: 400 });
    }

    const updated = updateDocument(body.id, body.patch || {});
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Document updated successfully',
      document: updated,
    });
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update document' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Document ID is required' }, { status: 400 });
    }

    const archived = archiveDocument(id);
    if (!archived) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot archive this document. Legally binding platform contracts (Leases, Escrow Deposits, Rent Receipts) are protected and immutable.',
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Document safely archived and hidden from active tenant view (audit log preserved).',
    });
  } catch (error) {
    console.error('Error archiving document:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to archive document' },
      { status: 500 }
    );
  }
}
