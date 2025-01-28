const API_URL = process.env.REACT_APP_API_URL

export const getPlans = async (affiliateId) => {
    try {

        const token = localStorage.getItem("token");
        const response = await fetch(API_URL, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
        return await response.json();
    } catch (error) {
        console.error("Error fetching plans:", error);
        return [];
    }
};

export const createPlan = async (planData) => {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json" },
            body: JSON.stringify(planData),
        });
        return await response.json();
    } catch (error) {
        console.error("Error creating plan:", error);
    }
};

export const updatePlan = async (planId, planData) => {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/${planId}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json" },
            body: JSON.stringify(planData),
        });
        return await response.json();
    } catch (error) {
        console.error("Error updating plan:", error);
    }
};

export const deletePlan = async (planId) => {
    try {
        const token = localStorage.getItem("token");
        await fetch(`${API_URL}/${planId}`, { method: "DELETE",
            headers: {
            "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json" },


        });
    } catch (error) {
        console.error("Error deleting plan:", error);
    }
};

export const buyPlan = async (planData, affiliateId, appliedCredit) => {
    try {

        const data = { planData, appliedCredit };
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/buy-plan/${affiliateId}`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return await response.json();

    } catch (error) {
        console.error("Error buying plan:", error);

    }
}

export const getUserCredit = async ( affiliateId) => {
    try {

        const token = localStorage.getItem("token");
        // Näiteks fetch() või axios() abil andmed edastada
        const response = await fetch(`${API_URL}/credit/${affiliateId}`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json" },

        });

        if (!response.ok) {
            throw new Error('Failed to fetch credit');
        }
        const data = await response.json();
return data
    } catch (error) {
        console.error(error);
        // kuva error kasutajale
    }
}