const BASE_URL = process.env.REACT_APP_API_URL

export const getUserCredits = async (affiliateId, userId) => {

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    try {
        const response = await fetch(`${BASE_URL}/credit?affiliateId=${affiliateId}&userId=${userId}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
                "role": `${role}`
            }
        });
        return await response.json();
    } catch (error) {
        console.error("Error fetching user credit:", error);
    }
}

export const addCredit = async (userId, affiliateId, amount, description) => {

    const token = localStorage.getItem("token");
    try {
        const response = await fetch(`${BASE_URL}/credit`, {
            method: "POST", headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({userId, amount, affiliateId, description}),
        });
        return response.ok;

    } catch (error) {
        console.error("Error adding credit:", error);
    }
}

export const getCreditHistory = async (affiliateId, userId) => {

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    try {
        const response = await fetch(`${BASE_URL}/credit/history?affiliateId=${affiliateId}&userId=${userId}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
                "role": `${role}`
            }
        });
        return await response.json();
    } catch (error) {
        console.error("Error fetching credit history:", error);
    }
}
