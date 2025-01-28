const API_BASE_URL = process.env.REACT_APP_API_URL



// 📌 ✅ Võta tellimused (`orders`)
export const getOrders = async (affiliateId) => {
    const token = localStorage.getItem("token");
    try {
        const response = await fetch(`${API_BASE_URL}/orders?affiliateId=${affiliateId}`, {
            method: "GET",
            credentials: "include",
            headers: { "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json" }
        });

        if (!response.ok) throw new Error("Failed to fetch orders");
        return await response.json(); // ⬅️ Massiiv tellimustega
    } catch (error) {
        console.error("❌ Error fetching orders:", error);
        return [];
    }
};

// 📌 ✅ Võta finantsandmed (`finance`)
export const getFinanceData = async (params) => {

    const token = localStorage.getItem("token");
    try {
        const response = await fetch(`${API_BASE_URL}/finance?${params.toString()}`, {
            method: "GET",
            credentials: "include",
            headers: { "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json" }
        });

        if (!response.ok) throw new Error("Failed to fetch finance data");
        return await response.json(); // ⬅️ { revenue, activeMembers, expiredMembers, totalMembers }
    } catch (error) {
        console.error("❌ Error fetching finance data:", error);
        return { revenue: 0, activeMembers: 0, expiredMembers: 0, totalMembers: 0 };
    }
};
