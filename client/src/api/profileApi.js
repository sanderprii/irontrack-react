const API_URL = process.env.REACT_APP_API_URL

export const getUserProfile = async (token) => {
    try {
        const response = await fetch(`${API_URL}/user`, {
            headers: { Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'},
        });
        return response.ok ? await response.json() : null;
    } catch (error) {
        console.error('Error fetching profile:', error);
        return null;
    }
};

export const updateUserProfile = async (userData, token) => {
    try {
        const response = await fetch(`${API_URL}/user`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(userData),
        });
        return response.ok;
    } catch (error) {
        console.error('Error updating profile:', error);
        return false;
    }
};

export const changeUserPassword = async (passwordData, token) => {
    try {
        const response = await fetch(`${API_URL}/user/change-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(passwordData),
        });
        return response.ok;
    } catch (error) {
        console.error('Error changing password:', error);
        return false;
    }
};

export const getUserPlansByAffiliate = async (affiliateId) => {
    try {

        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/user/user-plans?affiliateId=${affiliateId}`,
            {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
        return response.ok ? await response.json() : [];
    } catch (error) {
        console.error('Error fetching plans:', error);
        return [];
    }
};