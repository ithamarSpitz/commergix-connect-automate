import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("OK", {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS"
      }
    });
  }

  try {
    const {
      name,
      city,
      phone,
      street,
      streetNumber,
      floor,
      apartment,
      shipmentType = '140',
      cargoType = '199'
    } = await req.json();

    // בניית פרטי המשלוח לצורך הדפסה ובדיקה
    const shipmentDetails = {
      name,
      city,
      phone,
      street,
      streetNumber,
      floor,
      apartment,
      shipmentType,
      cargoType
    };
    console.log("📦 פרטי משלוח:", shipmentDetails);

    // אם יש פרמטר debugOnly, מחזירים את הפרטים בלי לשלוח
    const url = new URL(req.url);
    if (url.searchParams.get("debugOnly") === "true") {
      return new Response(JSON.stringify({
        debug: true,
        message: "📦 פרטי משלוח לבדיקה בלבד (לא נשלח לצ׳יטה)",
        shipmentDetails
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*"
        }
      });
    }

    // ולידציה בסיסית
    if (!name || !city || !phone || !street || !streetNumber) {
      throw new Error("חסרים נתונים הכרחיים למשלוח");
    }

    const arg = `-N30096,-Aמסירה,-N${shipmentType},-N4,-A,-A,-N${cargoType},-N,-N,-N,-A${name},-A,-A${city},-A,-A${street},-A${streetNumber},-A,-A${floor || ''},-A${apartment || ''},-A${phone},-A,-A,-A,-A,-A,-A,-A,-A,-N,-N,-N,-A,-A,-N,-N,-AXML,-AY,-A,-N,-A,-N,-N`;

    const baseURL = 'https://chita-il.com/RunCom.Server/Request.aspx';
    const params = new URLSearchParams({
      APPNAME: 'run',
      PRGNAME: 'ship_create_anonymous',
      ARGUMENTS: arg
    });
    const requestURL = `${baseURL}?${params.toString()}`;

    console.log("שולח בקשה לצ׳יטה:", requestURL);

    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwczovL3J1bmNvbS5jby5pbC9jbGFpbXMvY2xpZW50bm8iOiIzMDA5NiIsImh0dHBzOi8vcnVuY29tLmNvLmlsL2NsYWltcy9waHJhc2UiOiJhMTE1ODk3Ny1hYTBkLTRhY2MtODY3Ni0wZGY2Y2ZlMTgyMTQiLCJleHAiOjE3NzMwNTIzMzUsImlzcyI6Imh0dHBzOi8vcnVuY29tLmNvLmlsIiwiYXVkIjoiaHR0cHM6Ly9ydW5jb20uY28uaWwifQ.yWnG7Mxg4nxqfg529JcNjcUVOcKPZwm862Jq6yuOytY";

    const response = await fetch(requestURL, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const responseData = await response.text();
    console.log("תשובה מצ׳יטה:", responseData);

    if (!response.ok) {
      throw new Error(`שגיאה מהשרת של צ׳יטה: ${response.status} ${response.statusText}`);
    }

    return new Response(JSON.stringify({
      success: true,
      message: "✅ המשלוח נשלח בהצלחה לצ׳יטה!",
      data: responseData,
      shipmentDetails
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
      }
    });
  } catch (error) {
    console.error("❌ שגיאה בפונקציה:", error);
    return new Response(JSON.stringify({
      success: false,
      message: `❌ שגיאה בשליחת המשלוח: ${error.message}`
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
      }
    });
  }
});