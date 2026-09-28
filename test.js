async function main() {
  // Step 1: Login
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' })
  });
  const cookie = loginRes.headers.get('set-cookie');
  const loginData = await loginRes.json();
  console.log('LOGIN:', loginData);

  // Step 2: Create a patient (using the session cookie)
  const createRes = await fetch('http://localhost:3000/api/patients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
    body: JSON.stringify({ full_name: 'Nadeesha Kumari', phone: '0771112223' })
  });
  console.log('CREATE PATIENT:', await createRes.json());

  // Step 3: List patients
  const listRes = await fetch('http://localhost:3000/api/patients', {
    headers: { 'Cookie': cookie }
  });
  console.log('PATIENT LIST:', await listRes.json());

    // Step 4: Create a doctor
  const docRes = await fetch('http://localhost:3000/api/doctors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
    body: JSON.stringify({ full_name: 'Dr. Nimal Perera', specialization: 'Cardiologist' })
  });
  console.log('CREATE DOCTOR:', await docRes.json());

  // Step 5: List doctors
  const docListRes = await fetch('http://localhost:3000/api/doctors', {
    headers: { 'Cookie': cookie }
  });
  console.log('DOCTOR LIST:', await docListRes.json());

    // Step 6: Book an appointment
  const apptRes = await fetch('http://localhost:3000/api/appointments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
    body: JSON.stringify({ patient_id: 1, doctor_id: 1, appt_date: '2026-10-01', appt_time: '10:00', reason: 'Checkup' })
  });
  console.log('BOOK APPOINTMENT:', await apptRes.json());

  // Step 7: List appointments
  const apptListRes = await fetch('http://localhost:3000/api/appointments', {
    headers: { 'Cookie': cookie }
  });
  console.log('APPOINTMENT LIST:', await apptListRes.json());

    // Step 8: Add a medical record
  const emrRes = await fetch('http://localhost:3000/api/emr', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
    body: JSON.stringify({ patient_id: 1, doctor_id: 1, diagnosis: 'Common Cold', prescription: 'Paracetamol 500mg', notes: 'Rest advised' })
  });
  console.log('ADD MEDICAL RECORD:', await emrRes.json());

  // Step 9: View patient's medical history
  const emrListRes = await fetch('http://localhost:3000/api/emr/patient/1', {
    headers: { 'Cookie': cookie }
  });
  console.log('MEDICAL HISTORY:', await emrListRes.json());

    // Step 10: Request a lab test
  const labRes = await fetch('http://localhost:3000/api/lab', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
    body: JSON.stringify({ patient_id: 1, doctor_id: 1, test_name: 'Complete Blood Count' })
  });
  const labData = await labRes.json();
  console.log('REQUEST LAB TEST:', labData);

  // Step 11: Mark sample collected
  const collectRes = await fetch(`http://localhost:3000/api/lab/${labData.id}/collect`, {
    method: 'PUT',
    headers: { 'Cookie': cookie }
  });
  console.log('MARK COLLECTED:', await collectRes.json());

  // Step 12: Enter result
  const resultRes = await fetch(`http://localhost:3000/api/lab/${labData.id}/result`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
    body: JSON.stringify({ result: 'WBC: 7.2, RBC: 4.8, Hemoglobin: 13.5 — Normal' })
  });
  console.log('ENTER RESULT:', await resultRes.json());

  // Step 13: List all lab tests
  const labListRes = await fetch('http://localhost:3000/api/lab', {
    headers: { 'Cookie': cookie }
  });
  console.log('LAB TEST LIST:', await labListRes.json());

    // Step 14: Add a medicine to inventory
  const medRes = await fetch('http://localhost:3000/api/pharmacy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
    body: JSON.stringify({ name: 'Paracetamol 500mg', stock_qty: 100, unit_price: 2.5, expiry_date: '2027-06-30', reorder_level: 20 })
  });
  const medData = await medRes.json();
  console.log('ADD MEDICINE:', medData);

  // Step 15: Dispense some stock
  const dispenseRes = await fetch(`http://localhost:3000/api/pharmacy/${medData.id}/dispense`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
    body: JSON.stringify({ qty: 10 })
  });
  console.log('DISPENSE:', await dispenseRes.json());

  // Step 16: List all pharmacy items
  const pharmListRes = await fetch('http://localhost:3000/api/pharmacy', {
    headers: { 'Cookie': cookie }
  });
  console.log('PHARMACY LIST:', await pharmListRes.json());

    // Step 17: Generate a bill
  const billRes = await fetch('http://localhost:3000/api/billing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
    body: JSON.stringify({ patient_id: 1, consultation_charge: 1500, lab_charge: 800 })
  });
  const billData = await billRes.json();
  console.log('GENERATE BILL:', billData);

  // Step 18: Record a payment
  const payRes = await fetch(`http://localhost:3000/api/billing/${billData.id}/payments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
    body: JSON.stringify({ amount: 2300, method: 'Cash' })
  });
  console.log('RECORD PAYMENT:', await payRes.json());

  // Step 19: Add a staff member
  const staffRes = await fetch('http://localhost:3000/api/staff', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
    body: JSON.stringify({ full_name: 'Kamala Silva', designation: 'Receptionist', phone: '0712223334' })
  });
  console.log('ADD STAFF:', await staffRes.json());

  //  List staff
  const staffListRes = await fetch('http://localhost:3000/api/staff', {
    headers: { 'Cookie': cookie }
  });
  console.log('STAFF LIST:', await staffListRes.json());

    //  Get dashboard stats
  const dashRes = await fetch('http://localhost:3000/api/reports/dashboard', {
    headers: { 'Cookie': cookie }
  });
  console.log('DASHBOARD:', await dashRes.json());
}

main();