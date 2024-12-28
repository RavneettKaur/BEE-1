document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('userForm');
    const userDataDiv = document.getElementById('userData');

    const fetchUserData = () => {
        fetch('http://localhost:3000/users')
            .then(response => response.json())
            .then(data => {
                if (data.length === 0) {
                    userDataDiv.innerHTML = '<p>No users registered yet.</p>';
                    return;
                }

                let table = `
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                           
                            </tr>
                        </thead>
                        <tbody>
                `;

                data.forEach(user => {
                    table += `
                        <tr>
                            <td>${user.name}</td>
                            <td>${user.email}</td>
                    
                      
                        </tr>
                    `;
                });

                table += `
                        </tbody>
                    </table>
                `;

                userDataDiv.innerHTML = table;
            })
            .catch(error => {
                console.error('Error fetching user data:', error);
                userDataDiv.innerHTML = '<p>Error loading user data.</p>';
            });
    };

    fetchUserData();

    form.addEventListener('submit', (e) => {
        e.preventDefault(); 

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
       

        if (!name || !email ) {
            alert('Please fill in all fields.');
            return;
        }

        const user = { name, email};

        fetch('http://localhost:3000/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        })
            .then(response => {
                if (response.ok) {
                    alert('User registered successfully!');
                    form.reset();
                    fetchUserData(); 
                } else {
                    alert('Failed to register user.');
                }
            })
            .catch(error => {
                console.error('Error submitting form:', error);
                alert('An error occurred while submitting the form.');
            });
    });
});
