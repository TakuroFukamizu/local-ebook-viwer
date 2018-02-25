// Route

import BookList from './components/BookList';
import BookViwer from './components/BookViwer';

export default {
    routes: [
        { path: '/'            , component: BookList },
        { path: '/book/:bookId', component: BookViwer }
    ]
};