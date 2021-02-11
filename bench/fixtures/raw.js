exports.ejs = `
	<ul>
		<% for (var i = 0, l = list.length; i < l; i ++) { %>
			<li>User: <%- list[i].user %> / Web Site: <%- list[i].site %></li>
		<% } %>
	</ul>
`;

exports.pug = `
ul
	-for (var i = 0, l = list.length; i < l; i ++) {
		li User: !{list[i].user} / Web Site: !{list[i].site}
	-}
`;

exports.hbs = `
<ul>
	{{#list}}
		<li>User: {{{user}}} / Web Site: {{{site}}}</li>
	{{/list}}
</ul>
`;

exports.dot = `
<ul>
	{{ for (var i = 0, l = it.list.length; i < l; i ++) { }}
		<li>User: {{=it.list[i].user}} / Web Site: {{=it.list[i].site}}</li>
	{{ } }}
</ul>
`;

// todo: not raw syntax
exports.tempura = `
<ul>
	{{#each list as item}}
		<li>User: {{ item.user }} / Web Site: {{ item.site }}</li>
	{{/list}}
</ul>
`;
