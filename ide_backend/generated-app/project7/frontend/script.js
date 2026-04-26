document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
    const noTasksMessage = document.getElementById('no-tasks-message');

    const STORAGE_KEY = 'productivityHubTasks';

    // Load tasks from local storage
    function loadTasks() {
        const tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        tasks.forEach(task => renderTask(task));
        updateNoTasksMessage();
    }

    // Save tasks to local storage
    function saveTasks() {
        const tasks = [];
        taskList.querySelectorAll('.task-item').forEach(item => {
            tasks.push({
                id: item.dataset.id,
                text: item.querySelector('.task-text').innerText,
                completed: item.classList.contains('completed')
            });
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }

    // Render a single task to the DOM
    function renderTask(task) {
        const li = document.createElement('li');
        li.classList.add('task-item');
        li.dataset.id = task.id;
        if (task.completed) {
            li.classList.add('completed');
        }

        li.innerHTML = `
            <div class="task-content">
                <input type="checkbox" class="complete-checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text">${escapeHTML(task.text)}</span>
            </div>
            <div class="task-actions">
                <button class="btn-icon edit"><i class="fas fa-edit"></i></button>
                <button class="btn-icon delete"><i class="fas fa-trash-alt"></i></button>
            </div>
        `;

        taskList.appendChild(li);
    }

    // Add a new task
    function addTask() {
        const taskText = taskInput.value.trim();
        if (taskText === '') {
            alert('Please enter a task description.');
            return;
        }

        const newTask = {
            id: Date.now().toString(), // Simple unique ID
            text: taskText,
            completed: false
        };

        renderTask(newTask);
        taskInput.value = '';
        saveTasks();
        updateNoTasksMessage();
    }

    // Toggle task completion
    function toggleComplete(event) {
        const checkbox = event.target;
        const taskItem = checkbox.closest('.task-item');
        taskItem.classList.toggle('completed');
        saveTasks();
    }

    // Enter edit mode for a task
    function enterEditMode(event) {
        const editButton = event.target.closest('.edit');
        if (!editButton) return;

        const taskItem = editButton.closest('.task-item');
        const taskTextSpan = taskItem.querySelector('.task-text');
        const currentText = taskTextSpan.innerText;

        // Replace text span with an input and buttons
        taskTextSpan.style.display = 'none';
        editButton.style.display = 'none';
        taskItem.querySelector('.delete').style.display = 'none';
        taskItem.querySelector('.complete-checkbox').style.display = 'none'; // Hide checkbox temporarily

        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.classList.add('edit-input'); // Add a class for styling/selection
        taskItem.querySelector('.task-content').prepend(input);
        input.focus();

        const saveBtn = document.createElement('button');
        saveBtn.textContent = 'Save';
        saveBtn.classList.add('save-btn');
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancel';
        cancelBtn.classList.add('cancel-btn');

        const actionsDiv = taskItem.querySelector('.task-actions');
        actionsDiv.prepend(saveBtn);
        actionsDiv.prepend(cancelBtn);
    }

    // Save edited task
    function saveEdit(event) {
        const saveButton = event.target.closest('.save-btn');
        if (!saveButton) return;

        const taskItem = saveButton.closest('.task-item');
        const input = taskItem.querySelector('.edit-input');
        const newText = input.value.trim();

        if (newText === '') {
            alert('Task description cannot be empty. Deleting task.');
            deleteTask(taskItem.dataset.id);
            return;
        }

        const taskTextSpan = taskItem.querySelector('.task-text');
        taskTextSpan.innerText = newText;

        // Restore original UI elements
        input.remove();
        saveButton.remove();
        taskItem.querySelector('.cancel-btn').remove();
        taskTextSpan.style.display = '';
        taskItem.querySelector('.edit').style.display = '';
        taskItem.querySelector('.delete').style.display = '';
        taskItem.querySelector('.complete-checkbox').style.display = '';

        saveTasks();
    }

    // Cancel edit mode
    function cancelEdit(event) {
        const cancelButton = event.target.closest('.cancel-btn');
        if (!cancelButton) return;

        const taskItem = cancelButton.closest('.task-item');

        // Restore original UI elements without saving
        taskItem.querySelector('.edit-input').remove();
        cancelButton.remove();
        taskItem.querySelector('.save-btn').remove();
        taskItem.querySelector('.task-text').style.display = '';
        taskItem.querySelector('.edit').style.display = '';
        taskItem.querySelector('.delete').style.display = '';
        taskItem.querySelector('.complete-checkbox').style.display = '';
    }

    // Delete a task
    function deleteTask(taskIdToDelete) {
       const taskItem = taskList.querySelector(`.task-item[data-id='${taskIdToDelete}']`);
       if(taskItem) {
           taskItem.remove();
           saveTasks();
           updateNoTasksMessage();
       }
    }

    function handleDeleteClick(event) {
        if (event.target.closest('.delete')) {
            const taskItem = event.target.closest('.task-item');
            if (confirm('Are you sure you want to delete this task?')) {
                deleteTask(taskItem.dataset.id);
            }
        }
    }

    // Update visibility of the 'no tasks' message
    function updateNoTasksMessage() {
        if (taskList.children.length === 0) {
            noTasksMessage.style.display = 'block';
        } else {
            noTasksMessage.style.display = 'none';
        }
    }

    // Helper to prevent XSS attacks
    function escapeHTML(str) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    // Event Listeners
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            addTask();
        }
    });

    // Event delegation for dynamically added tasks
    taskList.addEventListener('click', (event) => {
        if (event.target.classList.contains('complete-checkbox')) {
            toggleComplete(event);
        }

        if (event.target.closest('.edit')) {
            enterEditMode(event);
        }

        if (event.target.closest('.delete')) {
            handleDeleteClick(event);
        }

        if (event.target.classList.contains('save-btn')) {
            saveEdit(event);
        }

        if (event.target.classList.contains('cancel-btn')) {
            cancelEdit(event);
        }

        // Allow editing by clicking the task text directly if not in edit mode
        if (event.target.classList.contains('task-text') && !event.target.style.display === 'none') {
             enterEditMode({
                 target: event.target.closest('.task-item').querySelector('.edit')
             });
        }
        // Toggle completion by clicking the task content area
        if (event.target.closest('.task-content') && !event.target.classList.contains('task-text')) {
            const checkbox = event.target.closest('.task-content').querySelector('.complete-checkbox');
            checkbox.checked = !checkbox.checked;
            toggleComplete({
                target: checkbox
            });
        }
    });

    // Allow saving edits by pressing Enter in the edit input
    taskList.addEventListener('keypress', (event) => {
        if (event.target.classList.contains('edit-input') && event.key === 'Enter') {
            saveEdit(event);
        }
         if (event.target.classList.contains('edit-input') && event.key === 'Escape') {
            cancelEdit(event);
        }
    });

    // Font Awesome integration for icons
    const iconScript = document.createElement('script');
    iconScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/js/all.min.js';
    iconScript.crossOrigin = 'anonymous';
    iconScript.integrity = 'sha512-8hK1fI+aM2b7M0Xl3/9wW+K6iM21g5f+nJ7Kz7f+5X/3Fp+F6JbA/2A==';
    iconScript.onload = () => {
        console.log('Font Awesome loaded.');
        // Ensure Font Awesome icons are correctly displayed after loading
        document.querySelectorAll('.btn-icon i').forEach(icon => {
            const originalClass = icon.className;
            icon.className = ''; // Clear existing classes
            setTimeout(() => icon.className = originalClass, 50); // Reapply classes with a slight delay
        });
    };
    document.head.appendChild(iconScript);

    loadTasks();
});
