'use strict';

const { remote, webFrame } = require('electron');

// app modules
const constants = require('./scripts/constants');
const storage = require('./scripts/storage');
const helpers = require('./scripts/helpers');

const YaDictionary = require('./api/ya.dictionary');
const HistoryStorage = require('./scripts/history-storage');
const FavoriteStorage = require('./scripts/favorite-storege');
const Notifications = require('./scripts/notifications');

const DictPage = require('./pages/dictionary');
const FavoritePage = require('./pages/favorite');

const PAGES = [
    {
        tplId: 'dict-page',
        title: 'dictionary',
        class: DictPage
    },
    {
        tplId: 'favorite-page',
        title: 'favorite',
        class: FavoritePage
    },
];

class App {

    constructor(appId) {
        this.win = remote.getCurrentWindow();

        // dom
        this.appEl = document.getElementById(appId || 'app');
        this.aSide = this.appEl.querySelector('#aside');
        this.pageEl = this.appEl.querySelector('#page');

        // storage
        storage.dictionary = new YaDictionary();
        storage.history = new HistoryStorage(constants.HISTORY_STORAGE_KEY);
        storage.favorite = new FavoriteStorage(constants.FAVORITE_STORAGE_KEY);
        storage.notifications = new Notifications(this.showDict.bind(this));

        // Disable pinch zoom
        webFrame.setZoomLevelLimits(1, 1);

        this.renderPagesButtons();
        this.bindHandlers();

        // default page
        this.showPage(PAGES[0]);
    }

    renderPagesButtons() {
        const html = document.createDocumentFragment();

        for (const page of PAGES) {
            const props = {
                title: page.title,
                'data-page': page.tplId
            };

            html.appendChild(helpers.html('button', props, page.title.substr(0, 1)));
        }

        helpers.replaceHtml(this.aSide, html);
    }

    bindHandlers() {
        this.aSide.addEventListener('click', event => this.onAsideClick(event));
    }

    showDict(dict) {
        console.log('showDict');
        storage.currentDict = dict;
        this.showPage(PAGES[0]); // TODO:

        if (!this.win.isVisible()) {
            this.win.show();
        }
    }

    showPage(page) {
        const inst = new page.class(page.tplId);
        helpers.replaceHtml(this.pageEl, inst.html);
    }

    onAsideClick(event) {
        const target = event.target;
        event.stopPropagation();

        if (target.dataset && target.dataset.page) {
            const page = PAGES.find(p => p.tplId === target.dataset.page);
            this.showPage(page);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => new App());
