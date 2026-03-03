import { PrismaClient } from '@prisma/client';
import { setCookieSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

const prisma = new PrismaClient();

export default async function LoginPage() {
    async function signIn(formData: FormData) {
        'use server';

        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        if (!email || !password) return;

        // A real production app would use bcrypt to compare hashes.
        // Given the parameters, we simulate the DB extraction:
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user || user.password_hash !== password) {
            // Stub error rendering handling. In Next 14 actions usually useState/useFormState hooks
            console.error("Invalid credentials");
            return;
        }

        // Assigning Server-side cookies via Next Headers utility
        await setCookieSession({
            id: user.id,
            role: user.role,
            building_id: user.building_id,
            unit_id: user.unit_id,
            first_name: user.first_name
        });

        // Routing dynamically on User Role
        if (user.role === 'manager' || user.role === 'admin') {
            redirect('/manager/dashboard');
        } else {
            redirect('/app/feed');
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <div className="w-16 h-16 bg-green-900 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-sm">
                    <span className="text-3xl text-white font-bold">H</span>
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Welcome to Hablock</h2>
                <p className="mt-2 text-slate-500">Sign in to your private community</p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md animate-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/40 sm:rounded-3xl sm:px-10 border border-slate-100">
                    <form action={signIn} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email address</label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-colors"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input id="remember-me" type="checkbox" className="h-4 w-4 rounded border-slate-300 text-green-600 focus:ring-green-600" />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-900">Remember me</label>
                            </div>
                            <div className="text-sm">
                                <a href="#" className="font-medium text-green-700 hover:text-green-800">Forgot password?</a>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-green-800 hover:bg-green-900 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                                Sign in
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center text-sm text-slate-500">
                        Don't have an account?{' '}
                        <Link href="/register" className="font-medium text-green-700 hover:text-green-800">
                            Register here
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
