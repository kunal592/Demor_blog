
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const { login } = useAuth();

    const handleGoogleResponse = async (response) => {
        try {
            await login(response);
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
                <h1 className="text-2xl font-bold mb-6">Login to Your Account</h1>
                <p className="mb-6">Please sign in using your Google account to continue.</p>
                <GoogleLogin
                    onSuccess={handleGoogleResponse}
                    onError={() => {
                        console.error("Google login error");
                    }}
                />
            </div>
        </div>
    );
};

export default Login;
