import Home from './pages/Home';
import AddTask from './pages/AddTask';
import TaskDetail from './pages/TaskDetail';
import EditTask from './pages/EditTask';
import CompletedTasks from './pages/CompletedTasks';
import CalendarSettings from './pages/CalendarSettings';


export const PAGES = {
    "Home": Home,
    "AddTask": AddTask,
    "TaskDetail": TaskDetail,
    "EditTask": EditTask,
    "CompletedTasks": CompletedTasks,
    "CalendarSettings": CalendarSettings,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
};