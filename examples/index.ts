// @ts-check
import * as tempura from '../';

interface User {
	firstname: string;
	lastname: string;
	avatar: string;
}

const user: User = {
	firstname: 'Luke',
	lastname: 'Edwards',
	avatar: 'https://avatars.githubusercontent.com/u/5855893?v=4',
};

// partial template #1
const image: tempura.Compiler<User> = tempura.compile(`
	{{#expect firstname, lastname, avatar}}
	<img src="{{ avatar }}" alt="{{ firstname }} {{ lastname }}"/>
`);

// partial template #2
const greet: tempura.Compiler<User> = tempura.compile(`
	<p>Welcome, {{ firstname }}!</p>
`, { loose: true });

// main template / render function
const render: tempura.Compiler<User> = tempura.compile(`
	{{#expect firstname, lastname, avatar}}
	<div class="avatar rounded">
		{{#image firstname=firstname lastname=lastname avatar=avatar }}
	</div>
	{{#greet firstname=firstname }}
	<p>You have {{{ firstname.length }}} unread messages</p>
`, {
	async: false,
	blocks: { greet, image }
});

let output = render(user);
console.log(output);
//=> <div class="avatar rounded">
//=> 	 <img src="https://avatars.githubusercontent.com/u/5855893?v=4" alt="Luke Edwards"/>
//=> </div>
//=> <p>Welcome, Luke!</p>
//=> <p>You have 4 unread messages</p>
