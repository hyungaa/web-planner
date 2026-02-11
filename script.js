document.addEventListener('DOMContentLoaded', () => {
    const todoForm = document.getElementById('todo-form');
    const todoTextInput = document.getElementById('todo-text');
    const todoDateInput = document.getElementById('todo-date');
    const todoPriorityInput = document.getElementById('todo-priority');
    const todoList = document.getElementById('todo-list');
    const showAllButton = document.getElementById('show-all');
    const showTodayButton = document.getElementById('show-today');

    let todos = JSON.parse(localStorage.getItem('todos')) || [];
    let currentFilter = 'all'; // 'all' or 'today'

    // 할 일 렌더링 함수
    function renderTodos() {
        todoList.innerHTML = ''; // 목록 초기화

        // 오늘 날짜를 YYYY-MM-DD 문자열로 미리 준비
        const now = new Date();
        const offset = now.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(now - offset)).toISOString().split('T')[0];

        const filteredTodos = todos.filter(todo => {
            if (currentFilter === 'today') {
                return todo.dueDate === localISOTime;
            }
            return true;
        });

        // 필터 버튼 활성화 상태 표시
        showAllButton.classList.toggle('active', currentFilter === 'all');
        showTodayButton.classList.toggle('active', currentFilter === 'today');

        filteredTodos.forEach((todo, index) => {
            const listItem = document.createElement('li');
            listItem.setAttribute('data-id', todo.id);
            listItem.classList.toggle('completed', todo.completed);

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = todo.completed;
            checkbox.addEventListener('change', () => toggleComplete(todo.id));

            const todoDetails = document.createElement('div');
            todoDetails.classList.add('todo-details');

            const todoText = document.createElement('span');
            todoText.classList.add('todo-text');
            todoText.textContent = todo.text;

            const todoMeta = document.createElement('span');
            todoMeta.classList.add('todo-meta');
            todoMeta.innerHTML = `마감일: ${todo.dueDate} | 우선순위: <span class="priority-${todo.priority}">${todo.priority}</span>`;

            todoDetails.appendChild(todoText);
            todoDetails.appendChild(todoMeta);
            listItem.appendChild(checkbox);
            listItem.appendChild(todoDetails);

            const todoActions = document.createElement('div');
            todoActions.classList.add('todo-actions');

            const editButton = document.createElement('button');
            editButton.textContent = '수정';
            editButton.classList.add('edit-btn');
            editButton.addEventListener('click', () => editTodo(todo.id));
            todoActions.appendChild(editButton);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = '삭제';
            deleteButton.classList.add('delete-btn');
            deleteButton.addEventListener('click', () => deleteTodo(todo.id));
            todoActions.appendChild(deleteButton);
            
            listItem.appendChild(todoActions);
            todoList.appendChild(listItem);
        });
    }

    // 할 일 추가 함수
    todoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newTodo = {
            text: todoTextInput.value.trim(),
            dueDate: todoDateInput.value,
            priority: todoPriorityInput.value,
            completed: false,
            id: Date.now() 
        };

        if (newTodo.text && newTodo.dueDate) {
            todos.push(newTodo);
            saveTodos();
            todoTextInput.value = '';
            todoDateInput.value = '';
            todoPriorityInput.value = 'medium';
            renderTodos();
        }
    });

    // 할 일 완료/미완료 토글 함수
    function toggleComplete(todoId) {
        const todoIndex = todos.findIndex(todo => todo.id === todoId);
        if (todoIndex > -1) {
            todos[todoIndex].completed = !todos[todoIndex].completed;
            saveTodos();
            renderTodos();
        }
    }


    // 할 일 저장 (로컬 스토리지)
    function saveTodos() {
        localStorage.setItem('todos', JSON.stringify(todos));
    }

    // 할 일 삭제 함수
    function deleteTodo(todoId) {
        todos = todos.filter(todo => todo.id !== todoId);
        saveTodos();
        renderTodos();
    }

    // 할 일 수정 모드 진입 함수
    function editTodo(todoId) {
        const todoIndex = todos.findIndex(todo => todo.id === todoId);
        if (todoIndex === -1) return;

        const todo = todos[todoIndex];
        const listItem = todoList.querySelector(`li[data-id="${todoId}"]`);

        if (!listItem) return;

        // Clear existing content and prepare for editing
        listItem.innerHTML = '';
        listItem.classList.remove('completed'); // Remove completed class during editing

        // Create editable input for text
        const textInput = document.createElement('input');
        textInput.type = 'text';
        textInput.value = todo.text;
        textInput.classList.add('edit-text-input');

        // Create editable input for date
        const dateInput = document.createElement('input');
        dateInput.type = 'date';
        dateInput.value = todo.dueDate;
        dateInput.classList.add('edit-date-input');

        // Create editable select for priority
        const prioritySelect = document.createElement('select');
        prioritySelect.classList.add('edit-priority-select');
        const priorities = ['low', 'medium', 'high'];
        priorities.forEach(p => {
            const option = document.createElement('option');
            option.value = p;
            option.textContent = p.charAt(0).toUpperCase() + p.slice(1); // Capitalize first letter
            if (p === todo.priority) {
                option.selected = true;
            }
            prioritySelect.appendChild(option);
        });

        const editControls = document.createElement('div');
        editControls.classList.add('edit-controls');
        editControls.appendChild(textInput);
        editControls.appendChild(dateInput);
        editControls.appendChild(prioritySelect);
        listItem.appendChild(editControls);

        // Create Save and Cancel buttons
        const saveButton = document.createElement('button');
        saveButton.textContent = '저장';
        saveButton.classList.add('save-btn');
        saveButton.addEventListener('click', () => {
            saveEditedTodo(todoId, textInput.value, dateInput.value, prioritySelect.value);
        });

        const cancelButton = document.createElement('button');
        cancelButton.textContent = '취소';
        cancelButton.classList.add('cancel-btn');
        cancelButton.addEventListener('click', () => {
            renderTodos(); // Re-render to discard changes
        });

        const editActionButtons = document.createElement('div');
        editActionButtons.classList.add('todo-actions'); // Reuse class for styling
        editActionButtons.appendChild(saveButton);
        editActionButtons.appendChild(cancelButton);
        listItem.appendChild(editActionButtons);
    }

    // 수정된 할 일 저장 함수
    function saveEditedTodo(todoId, newText, newDate, newPriority) {
        const todoIndex = todos.findIndex(todo => todo.id === todoId);
        if (todoIndex > -1) {
            todos[todoIndex].text = newText;
            todos[todoIndex].dueDate = newDate;
            todos[todoIndex].priority = newPriority;
            saveTodos();
            renderTodos();
        }
    }

    // 필터링 버튼 이벤트 리스너
    showAllButton.addEventListener('click', () => {
        currentFilter = 'all';
        renderTodos();
    });

    showTodayButton.addEventListener('click', () => {
        currentFilter = 'today';
        renderTodos();
    });

    // 초기 렌더링
    renderTodos();
});
