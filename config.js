// ใส่ค่าจาก Supabase → Project Settings → API (anon key เป็นกุญแจสาธารณะ ปลอดภัยเพราะมี Row Level Security)
// ถ้าเว้นว่างไว้ แอปจะมีช่องให้กรอกในหน้า "ผลคะแนน" แทน
window.SUPABASE_CONFIG = { url: "", anonKey: "" };
