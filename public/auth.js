function loadPageAuth(page){
    const userPages = ['intro','upload','analytics']
    const adminPages = ['dashboard','mapboard']
    $.ajax({
        url: 'http://localhost:3000/authorization',
        data: null,
        cache: false,
        contentType: "application/json",
        processData: false,
        method: 'GET',
        success: function(data){
            if(data.isAdmin === 0){
                if(adminPages.includes(page))
                    window.location.replace("./intro.html");
            }else if (data.isAdmin === 1){
                if(userPages.includes(page))
                    window.location.replace("./dashboard.html");
            }else{
                window.location.replace("./login.html");
            }
        }
    });
}