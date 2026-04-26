document.addEventListener('DOMContentLoaded', () => {
    const todoInput = document.getElementById('todo-input');
    const addTodoBtn = document.getElementById('add-todo-btn');
    const todoList = document.getElementById('todo-list');
    const weatherDisplay = document.getElementById('weather-display');
    const forecastDisplay = document.getElementById('forecast-display');

    // --- Weather Configuration --- 
    // IMPORTANT: Replace with your actual API keys and preferred location.
    // For security, consider using a backend proxy to hide your API keys.
    const API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY'; // Get a free key from https://openweathermap.org/
    const GEO_API_KEY = 'YOUR_GEOAPIFY_API_KEY'; // Get a free key from https://www.geoapify.com/
    const DEFAULT_LAT = '40.7128'; // New York City latitude
    const DEFAULT_LON = '-74.0060'; // New York City longitude
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/weather?appid=${API_KEY}&units=metric`;
    const FORECAST_API_URL = `https://api.openweathermap.org/data/2.5/forecast?appid=${API_KEY}&units=metric`;

    // --- To-Do List Logic --- 
    let todos = [];

    // Load todos from local storage
    const loadTodos = () => {
        const storedTodos = localStorage.getItem('todos');
        if (storedTodos) {
            todos = JSON.parse(storedTodos);
        }
        renderTodos();
    };

    // Save todos to local storage
    const saveTodos = () => {
        localStorage.setItem('todos', JSON.stringify(todos));
    };

    // Render the list of todos
    const renderTodos = () => {
        todoList.innerHTML = ''; // Clear current list
        if (todos.length === 0) {
            todoList.innerHTML = '<li class="loading">No tasks yet!</li>';
            return;
        }

        todos.forEach((todo, index) => {
            const li = document.createElement('li');
            li.dataset.index = index;
            if (todo.completed) {
                li.classList.add('completed');
            }

            li.innerHTML = `
                <div class="task-content">
                    <input type="checkbox" class="complete-checkbox" ${todo.completed ? 'checked' : ''}>
                    <span class="task-text">${escapeHtml(todo.text)}</span>
                </div>
                <div class="task-actions">
                    <button class="edit-btn">✏️</button>
                    <button class="delete-btn">🗑️</button>
                </div>
            `;

            // Add event listeners for checkboxes, edit, and delete buttons
            const checkbox = li.querySelector('.complete-checkbox');
            checkbox.addEventListener('change', () => toggleComplete(index));

            const editBtn = li.querySelector('.edit-btn');
            editBtn.addEventListener('click', () => editTodo(index, li));

            const deleteBtn = li.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => deleteTodo(index, li));

            todoList.appendChild(li);
        });
    };

    // Add a new todo
    const addTodo = () => {
        const taskText = todoInput.value.trim();
        if (taskText) {
            todos.push({ text: taskText, completed: false });
            saveTodos();
            renderTodos();
            todoInput.value = '';
        } else {
            alert('Please enter a task!');
        }
    };

    // Toggle task completion
    const toggleComplete = (index) => {
        if (index >= 0 && index < todos.length) {
            todos[index].completed = !todos[index].completed;
            saveTodos();
            renderTodos(); // Re-render to update styling
        }
    };

    // Edit an existing todo
    const editTodo = (index, listItem) => {
        if (index < 0 || index >= todos.length) return;

        const taskTextSpan = listItem.querySelector('.task-text');
        const currentText = todos[index].text;

        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.classList.add('edit-input'); // Add a class for styling

        // Replace the span with the input field
        taskTextSpan.style.display = 'none';
        listItem.querySelector('.task-content').insertBefore(input, taskTextSpan);
        input.focus();
        input.select();

        // Add event listener for finishing edit (Enter or Blur)
        const finishEdit = () => {
            const newText = input.value.trim();
            if (newText && newText !== currentText) {
                todos[index].text = newText;
                saveTodos();
                renderTodos(); // Re-render to update the span and remove input
            } else {
                // If text is empty or unchanged, revert back
                taskTextSpan.style.display = 'inline';
                input.remove();
            }
        };

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                finishEdit();
            }
        });

        input.addEventListener('blur', finishEdit);
    };


    // Delete a todo
    const deleteTodo = (index, listItem) => {
        if (index >= 0 && index < todos.length) {
            todos.splice(index, 1);
            saveTodos();
            renderTodos();
        }
    };

    // --- Weather API Logic --- 
    const fetchWeather = async (lat, lon) => {
        weatherDisplay.innerHTML = '<p class="loading">Loading weather...</p>';
        try {
            const response = await fetch(`${WEATHER_API_URL}&lat=${lat}&lon=${lon}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            displayWeather(data);
        } catch (error) {
            console.error("Error fetching weather:", error);
            weatherDisplay.innerHTML = `<p class="error">Could not fetch weather data. ${error.message}</p>`;
        }
    };

    const fetchForecast = async (lat, lon) => {
        forecastDisplay.innerHTML = '<p class="loading">Loading forecast...</p>';
        try {
            const response = await fetch(`${FORECAST_API_URL}&lat=${lat}&lon=${lon}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            displayForecast(data);
        } catch (error) {
            console.error("Error fetching forecast:", error);
            forecastDisplay.innerHTML = `<p class="error">Could not fetch forecast data. ${error.message}</p>`;
        }
    };

    const displayWeather = (data) => {
        if (!data || !data.main || !data.weather || !data.name) {
            weatherDisplay.innerHTML = '<p class="error">Invalid weather data received.</p>';
            return;
        }

        const { main, weather, name } = data;
        const temp = Math.round(main.temp);
        const description = weather[0].description;
        const iconCode = weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

        weatherDisplay.innerHTML = `
            <img src="${iconUrl}" alt="${description}">
            <p class="location">${name}</p>
            <p class="temp">${temp}°C</p>
            <p class="description">${description}</p>
        `;
    };

    const displayForecast = (data) => {
        if (!data || !data.list || data.list.length === 0) {
            forecastDisplay.innerHTML = '<p class="error">Invalid forecast data received.</p>';
            return;
        }

        // Filter for one forecast per day (e.g., midday forecast)
        const dailyForecasts = {};
        data.list.forEach(item => {
            const date = new Date(item.dt * 1000);
            const day = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            const hour = date.getHours();

            // Get the forecast around noon (12:00-15:00)
            if (hour >= 12 && hour < 15 && !dailyForecasts[day]) {
                dailyForecasts[day] = {
                    temp: Math.round(item.main.temp),
                    icon: item.weather[0].icon,
                    description: item.weather[0].description
                };
            }
        });

        let forecastHTML = '';
        Object.keys(dailyForecasts).slice(1, 4).forEach(day => { // Skip today, show next 3 days
            const forecast = dailyForecasts[day];
            const iconUrl = `https://openweathermap.org/img/wn/${forecast.icon}@2x.png`;
            forecastHTML += `
                <div class="forecast-day card">
                    <h3>${day}</h3>
                    <img src="${iconUrl}" alt="${forecast.description}">
                    <p class="temp">${forecast.temp}°C</p>
                </div>
            `;
        });

        if (forecastHTML) {
            forecastDisplay.innerHTML = forecastHTML;
        } else {
            forecastDisplay.innerHTML = '<p class="error">Could not display forecast.</p>';
        }
    };

    // Function to get user's location and then fetch weather
    const getUserLocation = () => {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                await fetchWeather(latitude, longitude);
                await fetchForecast(latitude, longitude);
            },
            async (error) => {
                console.warn(`Geolocation error (${error.code}): ${error.message}. Using default location.`);
                // Fallback to default location if geolocation fails
                await fetchWeather(DEFAULT_LAT, DEFAULT_LON);
                await fetchForecast(DEFAULT_LAT, DEFAULT_LON);
            }
        );
    };

    // Helper function to escape HTML characters
    const escapeHtml = (unsafe) => {
        return unsafe
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    }

    // --- Event Listeners --- 
    addTodoBtn.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTodo();
        }
    });

    // --- Initial Load --- 
    loadTodos();
    getUserLocation(); // Get location and fetch weather
});
