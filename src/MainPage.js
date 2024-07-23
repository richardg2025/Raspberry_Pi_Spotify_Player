const LaunchPage = () => {
    const handleRedirect = () => {
        // Add code here to handle the redirect to App.js
        window.location.href = '/app'; // Redirect to the /app URL
    };

    return (
        <div>
            <h1>Welcome to Your RFID Spotify Player</h1>
            <p>Click the button below to start scanning your RFID card:</p>
            <button onClick={handleRedirect}>Redirect to App.js</button>
        </div>
    );
};

export default LaunchPage;