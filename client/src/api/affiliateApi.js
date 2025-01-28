const API_URL = process.env.REACT_APP_API_URL



export const getAffiliate = async () => {
    try {

const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/my-affiliate`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });



        if (!response.ok) {
            throw new Error(`Error fetching affiliate: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("❌ Error fetching affiliate data:", error);
        return null;
    }
};
// Affiliate andmete uuendamine
export const updateAffiliate = async (affiliate) => {
    try {


        const token = localStorage.getItem("token");



        const response = await fetch(`${API_URL}/affiliate`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(affiliate),
        });

        if (!response.ok) {
            throw new Error(`Error updating affiliate: ${response.statusText}`);
        }

        return true;
    } catch (error) {
        console.error("Error updating affiliate:", error);
        return false;
    }
};

// Treenerite otsing (kasutaja sisendi põhjal)
export const searchTrainers = async (query) => {
    try {

        const token = localStorage.getItem("token");

        const response = await fetch(`${API_URL}/search-users?q=${encodeURIComponent(query)}`, {
            method: "GET",
            headers: {

                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Error searching trainers: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error searching trainers:", error);
        return [];
    }
};

