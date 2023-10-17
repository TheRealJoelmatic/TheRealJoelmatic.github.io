function checkPage() {
    var screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    if (screenWidth < 800)
    {
        console.log(screenWidth);
        window.location.href = 'https://joelmatic.com';
    }
}

checkPage();