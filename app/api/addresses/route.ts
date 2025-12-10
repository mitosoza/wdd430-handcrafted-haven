import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { fetchUserAddresses } from '@/app/lib/data';
import { createAddress, AddressState } from '@/app/lib/actions';

export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.email || !session?.user?.role) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const addresses = await fetchUserAddresses(session.user.email, session.user.role);

        return NextResponse.json({ addresses });
    } catch (error) {
        console.error('Failed to fetch addresses:', error);
        return NextResponse.json({ error: 'Failed to fetch addresses' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();

        // Call the createAddress server action
        const initialState: AddressState = { message: null, errors: {} };
        const result = await createAddress(initialState, formData);

        if (result.errors && Object.keys(result.errors).length > 0) {
            return NextResponse.json({
                error: result.message || 'Validation failed',
                errors: result.errors
            }, { status: 400 });
        }

        return NextResponse.json({ message: result.message });
    } catch (error) {
        console.error('Failed to create address:', error);
        return NextResponse.json({ error: 'Failed to create address' }, { status: 500 });
    }
}