import crypto from 'crypto';

export const generateInviteLink = () => {
    const randomString = crypto.randomBytes(20).toString('hex');
    
    // Determine the base URL depending on the environment variable a3s
    const baseURL = process.env.NODE_ENV === 'production' 
        ? 'https://mern-chat-frontend-azure.vercel.app'  
        : `http://localhost:${process.env.PORT || 5000}`; 

    return `${baseURL}/invite/${randomString}`;
};
