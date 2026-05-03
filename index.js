async function publish() {
    const code = document.getElementById('editor').value;
    const status = document.getElementById('status') || alert;

    try {
        const response = await fetch('http://localhost:8000/publish', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                site_name: currentSite,
                html_content: code
            })
        });

        const result = await response.json();
        if (response.ok) {
            alert(`🌿 Live! View your site at: ${result.url}`);
            window.open(result.url, '_blank');
        } else {
            alert("Deployment failed. Check console.");
        }
    } catch (err) {
        console.error(err);
    }
}
