class Chatbox {
    constructor() {
        this.args = {
            openButton: document.querySelector('.chatbox__button'),
            chatBox: document.querySelector('.chatbox__support'),
            sendButton: document.querySelector('.chatbox__send'),
            closeButton: document.querySelector('.chatbox__close')
        }

        this.state = false;
        this.messages = [];
    }

    display() {
        const { openButton, chatBox, sendButton, closeButton } = this.args;

        openButton.addEventListener('click', () => this.toggleState(chatBox))
        closeButton.addEventListener('click', () => this.toggleState(chatBox))

        sendButton.addEventListener('click', () => this.onSendButton(chatBox))

        const node = chatBox.querySelector('input');
        node.addEventListener("keyup", ({ key }) => {
            if (key === "Enter") {
                this.onSendButton(chatBox)
            }
        })
    }

    toggleState(chatbox) {
        this.state = !this.state;

        // show or hides the box
        if (this.state) {
            chatbox.classList.add('chatbox--active')
            this.args.openButton.classList.add('hide');

            const messageExists = this.messages.some(msg => msg.name === "Sam" && msg.message === "Hi.Welcome to Prince Solution.");
            if (!messageExists) {
                let msg2 = { name: "Sam", message: "Hi.Welcome to Prince Solution." };
                this.messages.push(msg2);

                msg2 = { name: "Sam", message: "How can I help you ?" };
                this.messages.push(msg2);

                this.updateChatText(chatbox);
            }

        } else {
            chatbox.classList.remove('chatbox--active')
            setTimeout(() => {
                this.args.openButton.classList.remove('hide');

            }, 600)

        }
    }

    onSendButton(chatbox) {

        var textField = chatbox.querySelector('input');
        let text1 = textField.value
        if (text1 === "") {
            return;
        }

        let msg1 = { name: "User", message: text1 }
        this.messages.push(msg1);

        this.updateChatText(chatbox)
        textField.value = ''
        const pathElement = document.getElementById('send');
        pathElement.setAttribute('fill', '#d7d7d7');

        this.AddTypingAnnimationBot(chatbox);

        fetch('http://127.0.0.1:5000/api/chat', {
            method: 'POST',
            body: JSON.stringify({ message: text1 }),
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
        })
            .then(r => r.json())
            .then(r => {
                setTimeout(() => {
                    let msg2 = { name: "Sam", message: r.response };
                    this.messages.push(msg2);
                    this.updateChatText(chatbox)
                    textField.value = ''
                }, 1000);
            }).catch((error) => {
                console.error('Error:', error);
                this.updateChatText(chatbox)
                textField.value = ''
            });

    }

    AddTypingAnnimationBot(chatbox) {
        var html = '';
        let prevName = ""
        this.messages.slice().forEach(function (item, index) {
            if (prevName != item.name) {
                if (item.name == "Sam")
                    html += '<div class="caption bot">' + 'Bot' + '</div>'
                else
                    html += '<div class="caption user">' + 'You' + '</div>'
                prevName = item.name;
            }

            if (item.name === "Sam") {
                html += '<div class="messages__item messages__item--visitor">' + item.message + '</div>'
            }
            else {
                html += '<div class="messages__item messages__item--operator">' + item.message + '</div>'
            }
        });

        const chatmessage = chatbox.querySelector('.chatbox__messages');
        html += '<div class="messages__item messages__item--visitor messages__item--type"> <div class="typing"> <div> </div> <div> </div> <div> </div> </div> </div>'

        chatmessage.innerHTML = html;
    }
    updateChatText(chatbox) {
        var html = '';
        let prevName = ""
        this.messages.slice().forEach(function (item, index) {
            console.log(item.message)
            if (prevName != item.name) {
                if (item.name == "Sam")
                    html += '<div class="caption bot">' + 'Bot' + '</div>'
                else
                    html += '<div class="caption user">' + 'You' + '</div>'
                prevName = item.name;
            }

            if (item.name === "Sam") {
                html += '<div class="messages__item messages__item--visitor">' + item.message + '</div>'
            }
            else {
                html += '<div class="messages__item messages__item--operator">' + item.message + '</div>'
            }
        });

        const chatmessage = chatbox.querySelector('.chatbox__messages');
        chatmessage.innerHTML = html;

        const div = document.querySelector('.chatbox__messages');

        const observer = new MutationObserver(() => {
            div.scrollTop = div.scrollHeight;
        });

        observer.observe(div, { childList: true });

    }
}

function handleChange(input) {
    const value = input.value;
    // Add your logic here
    const pathElement = document.getElementById('send');

    // Change the fill color based on the condition
    if (value && value != "") {
        pathElement.setAttribute('fill', '#0066ff');
    } else {
        pathElement.setAttribute('fill', '#d7d7d7');
    }
}

const chatbox = new Chatbox();
chatbox.display();

