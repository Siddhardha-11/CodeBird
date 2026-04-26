document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');

    // Load tasks from local storage on initial load
    loadTasks();

    // Event listener for adding a task
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    function addTask() {
        const taskText = taskInput.value.trim();

        if (taskText === '') {
            alert('Please enter a task!');
            return;
        }

        const task = {
            id: Date.now(), // Simple unique ID
            text: taskText,
            completed: false
        };

        // Add task to the UI
        renderTask(task);

        // Save to local storage
        saveTasks();

        // Clear input
        taskInput.value = '';
    }

    function renderTask(task) {
        const listItem = document.createElement('li');
        listItem.classList.add('task-item');
        listItem.setAttribute('data-id', task.id);

        if (task.completed) {
            listItem.classList.add('completed');
        }

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => toggleComplete(task.id));

        const taskTextSpan = document.createElement('span');
        taskTextSpan.textContent = task.text;
        taskTextSpan.addEventListener('dblclick', () => editTask(task.id, taskTextSpan));

        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('task-actions');

        const editBtn = document.createElement('button');
        editBtn.classList.add('task-action-btn', 'edit-btn');
        editBtn.innerHTML = '<i class="fas fa-edit">&#9998;</i>'; // Pencil icon
        editBtn.addEventListener('click', () => editTask(task.id, taskTextSpan));

        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('task-action-btn', 'delete-btn');
        deleteBtn.innerHTML = '<i class="fas fa-trash">&#128465;</i>'; // Trash icon
        deleteBtn.addEventListener('click', () => deleteTask(task.id));

        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);

        listItem.appendChild(checkbox);
        listItem.appendChild(taskTextSpan);
        listItem.appendChild(actionsDiv);

        taskList.appendChild(listItem);
    }

    function toggleComplete(id) {
        const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        const taskIndex = tasks.findIndex(task => task.id == id);

        if (taskIndex > -1) {
            tasks[taskIndex].completed = !tasks[taskIndex].completed;
            saveTasks();

            // Update UI immediately
            const listItem = taskList.querySelector(`[data-id="${id}"]`);
            if (listItem) {
                listItem.classList.toggle('completed');
            }
        }
    }

    function editTask(id, spanElement) {
        const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        const taskIndex = tasks.findIndex(task => task.id == id);

        if (taskIndex === -1) return;

        const currentText = tasks[taskIndex].text;
        const editingPrompt = prompt('Edit task:', currentText);

        if (editingPrompt !== null && editingPrompt.trim() !== '') {
            tasks[taskIndex].text = editingPrompt.trim();
            saveTasks();

            // Update UI immediately
            spanElement.textContent = editingPrompt.trim();
            // Update the taskTextSpan in the UI to reflect the current task object state
            const listItem = taskList.querySelector(`[data-id="${id}"]`);
            if(listItem) {
                const updatedSpan = listItem.querySelector('span');
                if(updatedSpan) {
                    updatedSpan.textContent = tasks[taskIndex].text;
                }
            }
        } else if (editingPrompt !== null && editingPrompt.trim() === '') {
            alert('Task cannot be empty.');
        }
    }

    function deleteTask(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
            tasks = tasks.filter(task => task.id != id);
            saveTasks();

            // Remove from UI
            const listItem = taskList.querySelector(`[data-id="${id}"]`);
            if (listItem) {
                listItem.remove();
            }
        }
    }

    function saveTasks() {
        const tasks = [];
        const listItems = taskList.querySelectorAll('.task-item');

        listItems.forEach(item => {
            const id = parseInt(item.getAttribute('data-id'));
            const text = item.querySelector('span').textContent;
            const completed = item.classList.contains('completed');
            tasks.push({ id, text, completed });
        });

        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function loadTasks() {
        const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        tasks.forEach(task => {
            renderTask(task);
        });
    }
});
