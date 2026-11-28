import React, { useMemo, useState } from "react";
import {
  Activity, AlertTriangle, Bell, Boxes, Building2, CheckCircle2, ChevronDown,
  Clock3, FileText, LayoutDashboard, LogOut, Menu, Package, Plus, Search,
  ShieldCheck, Stethoscope, X,
} from "lucide-react";
import { initials } from "./api.js";

const initialStock = [
  { id: 1, name: "Amlodipine", strength: "5 mg", category: "Blood pressure", facility: "Matuu Health Centre", quantity: 80, threshold: 20, updated: "Today, 10:42 AM" },
  { id: 2, name: "Paracetamol", strength: "500 mg", category: "Pain relief", facility: "Matuu Health Centre", quantity: 240, threshold: 50, updated: "Today, 10:35 AM" },
  { id: 3, name: "Metformin", strength: "500 mg", category: "Diabetes", facility: "Matuu Health Centre", quantity: 12, threshold: 25, updated: "Today, 9:15 AM" },
  { id: 4, name: "Amoxicillin", strength: "250 mg", category: "Antibiotic", facility: "Kithimani Clinic", quantity: 0, threshold: 30, updated: "Yesterday, 4:20 PM" },
  { id: 5, name: "Salbutamol", strength: "100 mcg", category: "Respiratory", facility: "Kithimani Clinic", quantity: 34, threshold: 15, updated: "Today, 8:50 AM" },
  { id: 6, name: "Cetirizine", strength: "10 mg", category: "Allergy", facility: "Matuu Health Centre", quantity: 9, threshold: 15, updated: "Today, 8:10 AM" },
];

const navItems = [
  ["Overview", LayoutDashboard],
  ["Stock records", Boxes],
  ["Medicine search", Search],
  ["Alerts", Bell],
  ["Reports", FileText],
];

// What each role can open. The first page is that role's home.
const ACCESS = {
  Patient: ["Medicine search"],
  Pharmacist: ["Overview", "Stock records", "Medicine search", "Alerts"],
  Administrator: ["Overview", "Stock records", "Alerts", "Reports", "Medicine search"],
};

function App({ user, onLogout }) {
  const role = user.role;
  const firstName = user.name.split(" ")[0];
  const allowed = ACCESS[role] || ACCESS.Patient;
  const home = allowed[0];
  const canRecord = role === "Pharmacist";
  const [page, setPage] = useState(home);
  const [stock, setStock] = useState(initialStock);
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [toast, setToast] = useState("");
  const [form, setForm] = useState({
    medicine: "Amlodipine", strength: "5 mg", facility: "Matuu Health Centre",
    type: "Received", quantity: "10",
  });

  const lowStock = stock.filter((i) => i.quantity > 0 && i.quantity <= i.threshold);
  const outOfStock = stock.filter((i) => i.quantity === 0);

  function notify(message) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }

  function saveStock(event) {
    event.preventDefault();
    const amount = Number(form.quantity);
    if (!amount || amount < 1) return notify("Enter a quantity greater than zero.");
    const existing = stock.find(
      (i) => i.name.toLowerCase() === form.medicine.toLowerCase() && i.facility === form.facility,
    );
    if (existing) {
      setStock((cur) =>
        cur.map((i) =>
          i.id === existing.id
            ? { ...i, quantity: Math.max(0, i.quantity + (form.type === "Received" ? amount : -amount)), updated: "Just now" }
            : i,
        ),
      );
    } else {
      setStock((cur) => [
        ...cur,
        {
          id: Math.max(0, ...cur.map((i) => i.id)) + 1,
          name: form.medicine, strength: form.strength, category: "Other",
          facility: form.facility, quantity: form.type === "Received" ? amount : 0,
          threshold: 10, updated: "Just now",
        },
      ]);
    }
    setShowForm(false);
    notify("Stock record updated successfully.");
  }

  const title = page === home ? "Hello" : page;
  const subtitle =
    page === "Overview" ? "Here is what's happening with medicine stock today."
    : page === "Medicine search" ? "Find medicine availability reported by nearby facilities."
    : page === "Stock records" ? "Record and monitor medicines received and dispensed."
    : page === "Alerts" ? "Review medicines that need attention."
    : "A quick picture of stock levels across facilities.";
  const alertCount = lowStock.length + outOfStock.length;

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><Plus size={23} strokeWidth={3} /></div>
          <div><strong>StockBridge</strong><span>KENYA</span></div>
          <button className="mobile-close" onClick={() => setMobileNav(false)}><X /></button>
        </div>
        <div className="workspace-label">WORKSPACE</div>
        <nav>
          {navItems.filter(([l]) => allowed.includes(l)).map(([label, Icon]) => (
            <button
              key={label}
              className={`nav-item ${page === label ? "active" : ""}`}
              onClick={() => { setPage(label); setMobileNav(false); }}
            >
              <Icon size={18} />
              <span>{label}</span>
              {label === "Alerts" && alertCount > 0 && <i className="nav-count">{alertCount}</i>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card">
            <ShieldCheck size={19} />
            <div>
              <b>Stock data safety</b>
              <span>Availability is based on the latest facility update.</span>
            </div>
          </div>
          <div className="profile">
            <div className="avatar">{initials(user.name)}</div>
            <div className="profile-text"><b>{user.name}</b><span>{role}</span></div>
            <button className="logout-btn" onClick={onLogout} title="Log out"><LogOut size={17} /></button>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button className="menu-button" onClick={() => setMobileNav(true)}><Menu /></button>
          <div className="crumb">Workspace <span>/</span> <b>{page}</b></div>
          <div className="top-actions">
            <span className="role-badge">{role}</span>
            {allowed.includes("Alerts") && (
              <button className="icon-button" title="Notifications" onClick={() => setPage("Alerts")}>
                <Bell size={19} />
                {alertCount > 0 && <i />}
              </button>
            )}
            <div className="top-avatar">{initials(user.name)}</div>
          </div>
        </header>

        <div className="content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">STOCKBRIDGE KENYA / {role.toUpperCase()}</div>
              <h1>{title}{page === home ? `, ${firstName}` : ""}</h1>
              <p>{subtitle}</p>
            </div>
            {(page === "Overview" || page === "Stock records") && canRecord && (
              <button className="primary-button" onClick={() => setShowForm(true)}>
                <Plus size={17} /> Record stock
              </button>
            )}
          </div>

          {page === "Overview" && <Overview stock={stock} lowStock={lowStock} outOfStock={outOfStock} setPage={setPage} />}
          {page === "Stock records" && <StockRecords stock={stock} onAdd={() => setShowForm(true)} canRecord={canRecord} />}
          {page === "Medicine search" && <MedicineSearch stock={stock} query={query} setQuery={setQuery} />}
          {page === "Alerts" && <Alerts lowStock={lowStock} outOfStock={outOfStock} />}
          {page === "Reports" && <Reports stock={stock} lowStock={lowStock} outOfStock={outOfStock} />}
          <footer>
            © 2026 StockBridge Kenya <span>•</span> Medicine availability information, made clearer.
          </footer>
        </div>
      </main>

      {showForm && (
        <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <form className="modal" onSubmit={saveStock}>
            <div className="modal-heading">
              <div>
                <span className="eyebrow">INVENTORY</span>
                <h2>Record medicine stock</h2>
                <p>Add received stock or record medicine dispensed.</p>
              </div>
              <button type="button" className="icon-button" onClick={() => setShowForm(false)}><X /></button>
            </div>
            <label>Medicine name
              <input value={form.medicine} onChange={(e) => setForm({ ...form, medicine: e.target.value })} required />
            </label>
            <div className="form-row">
              <label>Strength
                <input value={form.strength} onChange={(e) => setForm({ ...form, strength: e.target.value })} required />
              </label>
              <label>Quantity
                <input type="number" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
              </label>
            </div>
            <label>Healthcare facility
              <select value={form.facility} onChange={(e) => setForm({ ...form, facility: e.target.value })}>
                <option>Matuu Health Centre</option>
                <option>Kithimani Clinic</option>
              </select>
            </label>
            <label>Record type
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option>Received</option>
                <option>Dispensed</option>
              </select>
            </label>
            <div className="modal-actions">
              <button type="button" className="secondary-button" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="primary-button" type="submit">Save record</button>
            </div>
          </form>
        </div>
      )}
      {toast && <div className="toast"><CheckCircle2 size={18} />{toast}</div>}
    </div>
  );
}

function StatCard({ label, value, note, icon: Icon, tone }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${tone}`}><Icon size={19} /></div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-note">{note}</div>
    </div>
  );
}

function Status({ quantity, threshold }) {
  if (quantity === 0) return <span className="status out">Out of stock</span>;
  if (quantity <= threshold) return <span className="status low">Low stock</span>;
  return <span className="status available">Available</span>;
}

function Overview({ stock, lowStock, outOfStock, setPage }) {
  const total = stock.reduce((s, i) => s + i.quantity, 0);
  const facilities = new Set(stock.map((i) => i.facility)).size;
  const count = lowStock.length + outOfStock.length;
  return (
    <>
      <div className="stats-grid">
        <StatCard label="Total units recorded" value={total.toLocaleString()} note="Across listed medicines" icon={Package} tone="teal" />
        <StatCard label="Medicine types" value={new Set(stock.map((i) => i.name)).size} note="In the stock catalogue" icon={Boxes} tone="blue" />
        <StatCard label="Low-stock items" value={lowStock.length} note="Need a stock review" icon={AlertTriangle} tone="orange" />
        <StatCard label="Facilities" value={facilities} note="Reporting stock information" icon={Building2} tone="purple" />
      </div>
      <div className="dashboard-grid">
        <section className="panel stock-panel">
          <div className="panel-heading">
            <div><h2>Recent stock overview</h2><p>Latest medicine records across facilities</p></div>
            <button className="text-button" onClick={() => setPage("Stock records")}>View all <span>→</span></button>
          </div>
          <StockTable stock={stock.slice(0, 5)} />
        </section>
        <section className="panel alert-panel">
          <div className="panel-heading">
            <div><h2>Needs attention</h2><p>Items at or below their safe threshold</p></div>
            <span className="alert-bubble">{count}</span>
          </div>
          {outOfStock.concat(lowStock).slice(0, 4).map((item) => (
            <div className="alert-row" key={item.id}>
              <div className="alert-symbol"><AlertTriangle size={17} /></div>
              <div className="alert-info">
                <b>{item.name} <small>{item.strength}</small></b>
                <span>{item.facility}</span>
              </div>
              <strong>{item.quantity} left</strong>
            </div>
          ))}
          {count === 0 && <div className="empty-state"><CheckCircle2 />No stock alerts right now.</div>}
          <button className="outline-button full-button" onClick={() => setPage("Alerts")}>Review alerts</button>
        </section>
      </div>
      <div className="info-strip">
        <div className="info-icon"><Clock3 size={20} /></div>
        <div>
          <b>Remember: check the update time</b>
          <p>StockBridge shows reported availability, not a guarantee that medicine is still on the shelf. Patients should confirm with the facility before travelling.</p>
        </div>
      </div>
    </>
  );
}

function StockTable({ stock }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr><th>MEDICINE</th><th>FACILITY</th><th>QUANTITY</th><th>STATUS</th><th>LAST UPDATED</th></tr>
        </thead>
        <tbody>
          {stock.map((item) => (
            <tr key={item.id}>
              <td><b>{item.name}</b><small>{item.strength} · {item.category}</small></td>
              <td>{item.facility}</td>
              <td className="quantity">{item.quantity}</td>
              <td><Status quantity={item.quantity} threshold={item.threshold} /></td>
              <td className="muted-cell">{item.updated}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StockRecords({ stock, onAdd, canRecord }) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div><h2>Medicine stock records</h2><p>Current quantities recorded by healthcare facilities.</p></div>
        {canRecord && <button className="primary-button compact" onClick={onAdd}><Plus size={16} /> Add record</button>}
      </div>
      <StockTable stock={stock} />
    </section>
  );
}

function MedicineSearch({ stock, query, setQuery }) {
  const [facility, setFacility] = useState("All facilities");
  const results = useMemo(
    () =>
      stock.filter(
        (i) =>
          `${i.name} ${i.strength} ${i.category}`.toLowerCase().includes(query.toLowerCase()) &&
          (facility === "All facilities" || i.facility === facility),
      ),
    [stock, query, facility],
  );
  return (
    <>
      <section className="search-hero">
        <div className="search-hero-icon"><Stethoscope size={25} /></div>
        <h2>Find medicine near you</h2>
        <p>Search the medicine name to see facilities that have reported availability.</p>
        <div className="search-controls">
          <div className="search-input">
            <Search size={19} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g. Amlodipine, Paracetamol..." />
          </div>
          <select value={facility} onChange={(e) => setFacility(e.target.value)}>
            <option>All facilities</option>
            <option>Matuu Health Centre</option>
            <option>Kithimani Clinic</option>
          </select>
        </div>
      </section>
      <div className="results-heading">
        <b>{results.length} result{results.length === 1 ? "" : "s"} found</b>
        <span>Availability based on latest facility updates</span>
      </div>
      <div className="medicine-results">
        {results.map((item) => (
          <div className="medicine-card" key={item.id}>
            <div className="medicine-card-top">
              <div className="medicine-pill"><Package size={19} /></div>
              <Status quantity={item.quantity} threshold={item.threshold} />
            </div>
            <h3>{item.name}</h3>
            <p>{item.strength} · {item.category}</p>
            <div className="facility-line"><Building2 size={16} />{item.facility}</div>
            <div className="medicine-card-bottom">
              <div><b>{item.quantity}</b><span> units reported</span></div>
              <small><Clock3 size={13} /> {item.updated}</small>
            </div>
            {item.quantity === 0 && (
              <div className="unavailable-note">This facility reports that this medicine is out of stock.</div>
            )}
          </div>
        ))}
      </div>
      {results.length === 0 && (
        <div className="panel empty-state"><Search />No matching medicine found. Try another name.</div>
      )}
      <div className="disclaimer">
        <ShieldCheck size={17} />
        <span>Always contact the facility to confirm availability before travelling. Stock information can change after the last update.</span>
      </div>
    </>
  );
}

function Alerts({ lowStock, outOfStock }) {
  const all = [...outOfStock, ...lowStock];
  return (
    <section className="panel">
      <div className="panel-heading">
        <div><h2>Stock alerts</h2><p>Medicines that are out of stock or below their safe threshold.</p></div>
        <span className="alert-bubble">{all.length}</span>
      </div>
      {all.map((item) => (
        <div className="full-alert" key={item.id}>
          <div className="alert-symbol"><AlertTriangle size={18} /></div>
          <div className="alert-info">
            <b>{item.name} · {item.strength}</b>
            <span>{item.facility} · Safe threshold: {item.threshold} units</span>
          </div>
          <div className="alert-quantity"><b>{item.quantity}</b><span>units remaining</span></div>
          <Status quantity={item.quantity} threshold={item.threshold} />
        </div>
      ))}
      {all.length === 0 && (
        <div className="empty-state"><CheckCircle2 />All listed medicines are above their safe thresholds.</div>
      )}
    </section>
  );
}

function Reports({ stock, lowStock, outOfStock }) {
  const total = stock.reduce((s, i) => s + i.quantity, 0);
  const max = Math.max(1, ...stock.map((i) => i.quantity));
  return (
    <>
      <div className="stats-grid">
        <StatCard label="Total units" value={total.toLocaleString()} note="Recorded stock quantity" icon={Package} tone="teal" />
        <StatCard label="Available medicine types" value={stock.filter((i) => i.quantity > 0).length} note="With more than zero units" icon={CheckCircle2} tone="blue" />
        <StatCard label="Low stock" value={lowStock.length} note="Below safe threshold" icon={AlertTriangle} tone="orange" />
        <StatCard label="Out of stock" value={outOfStock.length} note="No units reported" icon={Activity} tone="purple" />
      </div>
      <section className="panel">
        <div className="panel-heading">
          <div><h2>Stock quantity by medicine</h2><p>A simple view of recorded units for each medicine.</p></div>
          <span className="report-tag">DEMO DATA</span>
        </div>
        <div className="bars">
          {stock.map((item) => (
            <div className="bar-row" key={item.id}>
              <div className="bar-label"><b>{item.name}</b><span>{item.quantity} units</span></div>
              <div className="bar-track">
                <div
                  className={`bar-fill ${item.quantity === 0 ? "zero" : item.quantity <= item.threshold ? "warning" : ""}`}
                  style={{ width: `${(item.quantity / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="report-footnote">
          <FileText size={16} /> This report uses the sample stock records currently shown in the demo.
        </div>
      </section>
    </>
  );
}

export default App;
