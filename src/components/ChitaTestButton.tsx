import { useEffect } from "react";

export default function ChitaTestButton() {
  const sendToChita = async () => {
    // פרטי המשלוח שנשלחים לציטה
    const shipmentDetails = {
      name: "אוריה פרל",
      city: "תל אביב",
      phone: "0521234567",
      street: "בן יהודה",
      streetNumber: "12",
      floor: "3",
      apartment: "7",
    };

    // הדפסת פרטי המשלוח לקונסול
    console.log("----------- פרטי המשלוח -----------");
    console.log("שם:", shipmentDetails.name);
    console.log("עיר:", shipmentDetails.city);
    console.log("טלפון:", shipmentDetails.phone);
    console.log("רחוב:", shipmentDetails.street);
    console.log("מספר בית:", shipmentDetails.streetNumber);
    console.log("קומה:", shipmentDetails.floor);
    console.log("דירה:", shipmentDetails.apartment);
    console.log("------------------------------------");

    console.log("שליחה ל־Supabase...");
    try {
      const res = await fetch("/functions/v1/create-shipment", {
        method: "POST",
        body: JSON.stringify(shipmentDetails),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const text = await res.text();
      console.log("תשובה מהפונקציה:", text);

      // ניסיון להציג את התשובה כ-JSON
      try {
        const jsonResponse = JSON.parse(text);
        console.log("פרטי תשובה מעובדים:", jsonResponse);
        if (jsonResponse.details) {
          console.log("----------- אישור פרטי משלוח -----------");
          console.log("שם:", jsonResponse.details.name);
          console.log("עיר:", jsonResponse.details.city);
          console.log("טלפון:", jsonResponse.details.phone);
          console.log("רחוב:", jsonResponse.details.street);
          console.log("מספר בית:", jsonResponse.details.streetNumber);
          console.log("קומה:", jsonResponse.details.floor);
          console.log("דירה:", jsonResponse.details.apartment);
          console.log("-----------------------------------------");
        }
      } catch (e) {
        // התשובה לא JSON תקין
        console.log("התשובה אינה בפורמט JSON תקין");
      }

      alert("הפונקציה ענתה:\n" + text);
    } catch (err) {
      console.error("שגיאה:", err);
      alert("שגיאה בשליחה: " + err.message);
    }
  };

  return (
    <button
      onClick={sendToChita}
      style={{ padding: "12px 24px", background: "blue", color: "white", borderRadius: "8px" }}
    >
      🧪 בדיקת משלוח צ'יטה
    </button>
  );
}
