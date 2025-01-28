const API_URL = process.env.REACT_APP_API_URL

export const getClassLeaderboard = async (classId) => {
    try {

        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/leaderboard?classId=${classId}`
        , {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
            });
        const data = await response.json();
        return Array.isArray(data) ? data : []; // ✅ Kui response pole massiiv, tagastame tühja massiivi
    } catch (error) {
        console.error("❌ Error fetching leaderboard:", error);
        return []; // ✅ Kui viga, tagastame tühja massiivi
    }
};
