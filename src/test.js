const axios = require('axios');

class Queue {
    constructor() {
        this.first = null;
        this.last = null;
        this.size = 0;
    }
    enqueue(value, level, id) {
        const newNode = new Node(value, level, id);

        if (this.size === 0) this.first = newNode;
        else this.last.next = newNode;
        this.last = newNode;
        return ++this.size;
    }

    dequeue() {
        if (this.first == null) return;
        this.size--;
        const firstNode = this.first;
        this.first = this.first.next;
        firstNode.next = null;
        return { value: firstNode.value, level: firstNode.level, id: firstNode.id };
    }
}

const stream = async (request, queue) => {
    try {
        const streamRequest = await axios.post('http://localhost:8000/stream', { request });
        console.log('streamRequest:', streamRequest);

        if (!streamRequest.ok) throw { status: streamRequest.status, message: streamRequest.message };

        const tree = streamRequest.data.data.tree;
        console.log('tree:', tree);
        // if (tree?.root) console.log('Tree:', tree);

        console.log('!tree?.isTreeComplete', !tree?.isTreeComplete);
        if (!tree?.isTreeComplete) setTimeout(() => stream(request, queue), 2000);
    } catch (err) {}
};

const func = async () => {
    try {
        const title = 'Google';
        const url = 'https://www.google.com/';
        const maxLevel = '2';
        const maxPages = '3';

        const request = { title, url, maxLevel, maxPages };
        const newQueueResult = await axios.post('http://localhost:8000/new-queue', { request });
        console.log(('newQueueResult:', newQueueResult));

        if ((newQueueResult.status !== 200, newQueueResult.status !== 201))
            throw { status: newQueueResult.status, message: newQueueResult.message };

        const queue = new Queue();
        const tree = await newQueueResult.data.data?.tree;
        console.log('Tree:', tree);
        // if (tree?.root) console.log('Tree:', tree);

        if (!tree?.isTreeComplete) setTimeout(() => stream(request, queue), 2000);
    } catch (err) {
        console.log(err);
    }
};

func();
