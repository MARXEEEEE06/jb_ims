import Sidebar from './sidebar/Sidebar.jsx';

function Layout({children}){
    return (
        <div className="layout">
            <Sidebar />
            <main className='content'>
                {children}
            </main>
        </div>
    );
}

export default Layout;