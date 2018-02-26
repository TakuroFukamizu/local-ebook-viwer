import Vue from 'vue';

import VueSessionStorage from 'vue-sessionstorage';
// import VueLocalStorage from 'vue-localstorage';

Vue.use(VueSessionStorage);
// Vue.use(VueLocalStorage); //tsで使えない

interface IBook {
    index: number;
    date: number;
}
class LastPageIndexModel {
    books: {[index:string]:IBook} = {};
}

class LocalData {
    getLastPageIndex(bookId:string, defaultValue:number):number {
        // return Vue.localStorage.get(`${bookId}/lastPageIndex`, 0, number);
        // return parseInt(localStorage.getItem(`${bookId}/lastPageIndex`) || defaultValue.toString());
        try {
            let sessionData = localStorage.getItem(`lastPageIndex`);
            if (!sessionData) return defaultValue;
            let obj = JSON.parse(sessionData) as LastPageIndexModel;
            if (obj.books[bookId] == null) return defaultValue;
            if (obj.books[bookId]["index"] == null) return defaultValue;
            return obj.books[bookId].index as number;
        } catch(ex) {
            console.error(ex);
            return defaultValue;
        }
    }
    setLastPageIndex(bookId:string, index:number) {
        // VueLocalStorage.set(`${bookId}/lastPageIndex`, index);
        // localStorage.setItem(`${bookId}/lastPageIndex`, index.toString());
        let obj: LastPageIndexModel|null = null;
        try {
            let sessionData = localStorage.getItem(`lastPageIndex`);
            if (sessionData!=null) obj = JSON.parse(sessionData) as LastPageIndexModel;
        } catch(ex) {
            console.log(ex);
        }
        if (!obj) obj =  new LastPageIndexModel();
        obj.books[bookId] = {
            index,
            date: new Date().getTime()
        } as IBook;
        localStorage.setItem(`lastPageIndex`, JSON.stringify(obj));
    }
}

export default new LocalData();