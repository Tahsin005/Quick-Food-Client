import Navbar from "./Navbar"
import { Toaster } from 'react-hot-toast';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-base-100">
            <Navbar></Navbar>
            <main className="max-w-7xl mx-auto px-4 py-6">
                { children }
            </main>
            <Toaster/>
        </div>
    )
}

export default Layout