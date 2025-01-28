const API_URL = process.env.REACT_APP_API_URL

export const getTodayWOD = async (affiliateId, date) => {
    try {
        const token = localStorage.getItem("token");
        const date1 = new Date(date).toISOString(); // ✅ Vormindatud ISO kuupäev
        const response = await fetch(`${API_URL}/get-today-wod?date=${date1}&affiliateId=${affiliateId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        return await response.json();
    } catch (error) {
        console.error("❌ Error fetching today's WOD:", error);
    }
};

export const getWeekWODs = async (affiliateId, startDate1) => {
    try {
        const token = localStorage.getItem("token");
        const startDate = new Date(startDate1);
        startDate.setHours(2, 0, 0, 0);
        const response = await fetch(`${API_URL}/get-week-wods?startDate=${startDate.toISOString()}&affiliateId=${affiliateId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        const text = await response.text();


        // Ensure response is valid JSON
        return JSON.parse(text);
    } catch (error) {
        console.error("❌ Error fetching week's WODs:", error);
    }
};


export const saveTodayWOD = async (affiliateId, wodData) => {
    try {
        const token = localStorage.getItem("token");

        const response = await fetch(`${API_URL}/today-wod`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(wodData), // ✅ Edasta ainult ühe päeva WOD
        });

        return await response.json();
    } catch (error) {
        console.error("❌ Error saving today's WOD:", error);
    }
};


export const applyWODToTrainings = async (affiliateId, date) => {
    try {
        const token = localStorage.getItem("token");
        const formattedDate = new Date(date);

        formattedDate.setHours(2, 0, 0, 0);


        const date1 = formattedDate.toISOString(); // ✅ Vormindatud ISO kuupäev

        const requestBody = { affiliateId, date: date1 }; // ✅ Parandatud JSON body

        const response = await fetch(`${API_URL}/apply-wod`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody) // ✅ Nüüd JSON-iks teisendatud õigesti
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("❌ Error applying WOD to trainings:", error);
    }
};


export const searchDefaultWODs = async (query) => {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/search-default-wods?q=${encodeURIComponent(query)}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        return await response.json();
    } catch (error) {
        console.error("❌ Error searching default WODs:", error);
    }
};
