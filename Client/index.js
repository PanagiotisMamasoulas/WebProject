$("#login").click(() => {
	reset();
	$.ajax({
		url: 'http://localhost:3000/login',
		// data: JSON.stringify(data),
		data: JSON.stringify({
			username: $('#username').val(),
			password: $('#password').val()
		}),
		cache: false,
		contentType: 'application/json',
		processData: false,
		// headers: { "Access-Control-Allow-Origin": "*" },
		method: 'POST',
		statusCode: {
			401: () => {
				wrongInput('Wrong username or password', 'liPassword');
			}
		},
		success: (data, status, request) => {
			localStorage.setItem('x-auth-token', request.getResponseHeader('x-auth-token'));
			window.location.assign('intro.html');
		}
	});
});

function wrongInput(input, element) {
	var para = document.createElement("p");
	var node = document.createTextNode(input);
	para.appendChild(node);
	para.setAttribute("class", "wrongText")
	document.getElementById(element).appendChild(para)
}

function reset() {
	var list = document.getElementsByTagName("INPUT");

	for (i = 0; i < list.length; i++) list[i].classList.remove("wrongInput"); var
		invalidTexts = document.getElementsByClassName('wrongText'); while (invalidTexts[0])
		invalidTexts[0].parentNode.removeChild(invalidTexts[0]);
}

	// function logIn() {

	// }
	// $(" #login").click(() => {
	// reset();
	// data = {
	// // username: $("#username").val(),
	// // password: $("#password").val(),
	// hellothere: "FUCK"
	// }
	// $.ajax({
	// url: "login",
	// type: "POST",
	// processData: true,
	// data: JSON.stringify(data),
	// cache: false,
	// dataType: "json",
	// success: function (data) {
	// console.log(this.data);
	// localStorage.setItem('x-auth-token', data.headers['x-auth-token']);
	// },
	// error: function (error) {
	// console.log(this.data);
	// wrongInput('Wrong username or password', 'liPassword');
	// }
	// });
	// });

	// xhr.setRequestHeader('Content-Type', 'application/JSON');
	// if (username == "") {
	// wrongInput('Please enter a username', 'liUsername');
	// } else if (password == "") {
	// wrongInput('Please enter a password', 'liPassword');
	// } else {
	// var data = JSON.stringify({ "username": username, "password": password });
	// xhr.send(data);
	// }
