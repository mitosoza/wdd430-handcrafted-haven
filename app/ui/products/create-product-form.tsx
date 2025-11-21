'use client';
 

import { useActionState } from 'react';
//import { createInvoice, State } from '@/app/lib/actions';
//import { CustomerField } from '@/app/lib/definitions';
import Link from 'next/link';
import { Button } from '@/app/ui/button';
import {createProduct, State } from '@/app/lib/actions';

// export default function form(){
//     const initialState = State = { message: null, errors: {} };

//     const [state, formAction] = useActionState(createProduct, initialState);

//     return (
//         <form action={formAction}>

//         </form>


//     )
// }