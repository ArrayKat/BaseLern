// Подключение к Supabase
const supabaseUrl = 'https://bayealsglckpqfidpyth.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJheWVhbHNnbGNrcHFmaWRweXRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3NTk0NTQsImV4cCI6MjA1ODMzNTQ1NH0.oabB42ua8lipGaJ8uIZqGjsRseCCTf0ayNWXFX3cgqc';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// Функция для создания блока с контентом
function createTopicBlock(title, id, description, presentationUrl, homeworkTasks) {
    const block = document.createElement("div");

    // Аккордеон (кнопка)
    const accordionButton = document.createElement("button");
    accordionButton.className = "accordion";
    accordionButton.textContent = title;
    block.appendChild(accordionButton);

    // Панель с контентом
    const panel = document.createElement("div");
    panel.className = "panel";

    // Заголовок темы
    const topicTitle = document.createElement("h2");
    topicTitle.id = id;
    topicTitle.textContent = title;
    panel.appendChild(topicTitle);

    // Описание темы
    const topicDescription = document.createElement("p");
    topicDescription.textContent = description;
    panel.appendChild(topicDescription);

    // Презентация (iframe)
    const iframe = document.createElement("iframe");
    iframe.src = presentationUrl;
    iframe.width = "100%";
    iframe.height = "400px";
    iframe.allowFullscreen = true;
    iframe.style.border = "none";
    panel.appendChild(iframe);

    // Домашнее задание
    const homework = document.createElement("div");
    homework.className = "homework";

    const homeworkTitle = document.createElement("h3");
    homeworkTitle.textContent = "Домашнее задание";
    homework.appendChild(homeworkTitle);

    const taskList = document.createElement("ol");

    // Добавление задач
    homeworkTasks.forEach(task => {
        const taskItem = document.createElement("li");
        taskItem.textContent = task;
        taskList.appendChild(taskItem);
    });

    homework.appendChild(taskList);
    panel.appendChild(homework);
    block.appendChild(panel);

    return block;
}

// Функция для загрузки данных из Supabase
async function loadTopics() {
    // Загружаем уроки
    const { data: lessons, error: lessonsError } = await supabaseClient
        .from('lessons')
        .select('*');

    if (lessonsError) {
        console.error('Ошибка при загрузке уроков:', lessonsError);
        return;
    }

    // Загружаем задачи для каждого урока
    const { data: homeworkTasks, error: tasksError } = await supabaseClient
        .from('homework_tasks')
        .select('*');

    if (tasksError) {
        console.error('Ошибка при загрузке задач:', tasksError);
        return;
    }

    console.log('Уроки:', lessons);
    console.log('Задачи:', homeworkTasks);

    // Группируем задачи по lesson_id
    const tasksByLessonId = homeworkTasks.reduce((acc, task) => {
        if (!acc[task.lesson_id]) {
            acc[task.lesson_id] = [];
        }
        acc[task.lesson_id].push(task.task);
        return acc;
    }, {});

    // Создаем блоки для каждого урока
    const contentContainer = document.getElementById("content");
    if (!contentContainer) {
        console.error('Элемент с id="content" не найден');
        return;
    }

    lessons.forEach(lesson => {
        const topicBlock = createTopicBlock(
            lesson.title,
            lesson.id,
            lesson.description,
            lesson.presentationUrl,
            tasksByLessonId[lesson.id] || [] // Если задач нет, используем пустой массив
        );
        contentContainer.appendChild(topicBlock);
    });

    // JavaScript для аккордеона
    const accordions = document.querySelectorAll(".accordion");
    accordions.forEach(accordion => {
        accordion.addEventListener("click", function() {
            this.classList.toggle("active");

            const panel = this.nextElementSibling;
            if (panel.style.maxHeight) {
                panel.style.maxHeight = null;
            } else {
                panel.style.maxHeight = panel.scrollHeight + "px";
            }
        });
    });
}

// Загрузка данных при загрузке страницы
document.addEventListener('DOMContentLoaded', loadTopics);