import { useState } from 'react'

const navBtnStyle = (isActive) => ({
  padding: '8px 14px',
  cursor: 'pointer',
  backgroundColor: isActive ? '#0f3d3e' : '#e0e0e0',
  color: isActive ? '#ffffff' : '#000000',
  border: 'none',
  borderRadius: '4px',
  fontWeight: 'bold',
})

const primaryBtnStyle = {
  padding: '10px 20px',
  backgroundColor: '#e65100',
  color: '#ffffff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 'bold',
}

function App() {
  const [activeTab, setActiveTab] = useState('search')
  const [searchQuery, setSearchQuery] = useState('')

  const stockData = [
    { id: 1, medicine: 'Amlodipine 5mg (Tablets)', facility: 'Nyeri County Referral Hospital', stock: 140, threshold: 40, status: 'In Stock', updated: '15 mins ago' },
    { id: 2, medicine: 'Amlodipine 5mg (Tablets)', facility: 'Mathari Mission Hospital', stock: 18, threshold: 30, status: 'Low Stock', updated: '1 hour ago' },
    { id: 3, medicine: 'Metformin 500mg (Tablets)', facility: 'Karatina Sub-County Hospital', stock: 0, threshold: 25, status: 'Out of Stock', updated: '30 mins ago' },
    { id: 4, medicine: 'Losartan 50mg (Tablets)', facility: 'Nyeri Town Health Centre', stock: 12, threshold: 30, status: 'Low Stock', updated: '5 mins ago' },
  ]

  const filteredStock = stockData.filter((item) =>
    item.medicine.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.facility.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <header style={{ borderBottom: '2px solid #0f3d3e', paddingBottom: '15px', marginBottom: '25px' }}>
        <h1 style={{ color: '#0f3d3e', margin: '0 0 5px 0' }}>StockBridge Kenya</h1>
        <p style={{ margin: '0 0 15px 0', color: '#555' }}>
          Closing the gap between medicine supply and patient access
        </p>

        <nav style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => setActiveTab('search')} style={navBtnStyle(activeTab === 'search')}>
            1. Patient Search
          </button>
          <button onClick={() => setActiveTab('login')} style={navBtnStyle(activeTab === 'login')}>
            2. Staff Login
          </button>
          <button onClick={() => setActiveTab('pharmacist')} style={navBtnStyle(activeTab === 'pharmacist')}>
            3. Pharmacist Portal
          </button>
          <button onClick={() => setActiveTab('admin')} style={navBtnStyle(activeTab === 'admin')}>
            4. Admin Dashboard
          </button>
        </nav>
      </header>

      {activeTab === 'search' && (
        <section>
          <h2>Search Available Medicine Near You</h2>
          <p>Check real-time facility stock before travelling.</p>
          <input
            type="text"
            placeholder="Search by medicine (e.g., Amlodipine) or hospital..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', maxWidth: '400px', padding: '10px', marginBottom: '20px', boxSizing: 'border-box' }}
          />
          <div style={{ overflowX: 'auto' }}>
            <table border="1" cellPadding="10" cellSpacing="0" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
              <thead style={{ backgroundColor: '#f4f4f4' }}>
                <tr>
                  <th>Medicine &amp; Strength</th>
                  <th>Healthcare Facility</th>
                  <th>Status</th>
                  <th>Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {filteredStock.map((item) => (
                  <tr key={item.id}>
                    <td>{item.medicine}</td>
                    <td>{item.facility}</td>
                    <td><strong>{item.status}</strong></td>
                    <td>Updated {item.updated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === 'login' && (
        <section>
          <h2>Facility &amp; Admin Login</h2>
          <form onSubmit={(e) => { e.preventDefault(); alert('Login submitted!') }}>
            <div style={{ marginBottom: '15px' }}>
              <label>Select Role:</label><br />
              <select style={{ padding: '8px', width: '250px' }}>
                <option value="pharmacist">Pharmacist</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label>Work Email:</label><br />
              <input type="email" placeholder="pharmacist@clinic.co.ke" required style={{ padding: '8px', width: '230px' }} />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label>Password:</label><br />
              <input type="password" required style={{ padding: '8px', width: '230px' }} />
            </div>
            <button type="submit" style={primaryBtnStyle}>Log In</button>
          </form>
        </section>
      )}

      {activeTab === 'pharmacist' && (
        <section>
          <h2>Pharmacist Stock Recording Portal</h2>
          <p>Facility: <strong>Nyeri Town Health Centre</strong></p>
          <form onSubmit={(e) => { e.preventDefault(); alert('Stock updated!') }}>
            <div style={{ marginBottom: '15px' }}>
              <label>Select Medicine (Standardized Catalog):</label><br />
              <select required style={{ padding: '8px', width: '280px' }}>
                <option value="">-- Choose Medicine --</option>
                <option value="1">Amlodipine 5mg (Tabs)</option>
                <option value="2">Losartan 50mg (Tabs)</option>
                <option value="3">Metformin 500mg (Tabs)</option>
              </select>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label>Transaction Type:</label><br />
              <select required style={{ padding: '8px', width: '280px' }}>
                <option value="received">Stock Received (Add to Inventory)</option>
                <option value="dispensed">Stock Dispensed (Subtract from Inventory)</option>
              </select>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label>Quantity (Units/Packs):</label><br />
              <input type="number" min="1" placeholder="e.g., 50" required style={{ padding: '8px', width: '260px' }} />
            </div>
            <button type="submit" style={primaryBtnStyle}>Update Stock</button>
          </form>
        </section>
      )}

      {activeTab === 'admin' && (
        <section>
          <h2>Admin Reports &amp; Low-Stock Alerts</h2>
          <div style={{ backgroundColor: '#fff3e0', borderLeft: '4px solid #e65100', padding: '12px', marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#e65100' }}>⚠️ Low-Stock Alerts</h3>
            <ul style={{ margin: 0 }}>
              <li><strong>Losartan 50mg</strong> at Nyeri Town Health Centre — 12 packs left (Threshold: 30)</li>
              <li><strong>Amlodipine 5mg</strong> at Mathari Mission Hospital — 18 packs left (Threshold: 30)</li>
            </ul>
          </div>
          <h3>Facility Stock Overview</h3>
          <div style={{ overflowX: 'auto' }}>
            <table border="1" cellPadding="10" cellSpacing="0" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
              <thead style={{ backgroundColor: '#f4f4f4' }}>
                <tr>
                  <th>Facility</th>
                  <th>Medicine</th>
                  <th>Current Stock</th>
                  <th>Safe Threshold</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stockData.map((item) => (
                  <tr key={item.id}>
                    <td>{item.facility}</td>
                    <td>{item.medicine}</td>
                    <td>{item.stock} packs</td>
                    <td>{item.threshold} packs</td>
                    <td><strong>{item.status}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}

export default App
