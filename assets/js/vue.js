"use strict";

Vue.component("treeselect", VueTreeselect.Treeselect);

var app = new Vue({
  el: "#app",
  store: store,

  computed: {
    ...Vuex.mapState(["questions"]),

    test() {
      let array = [];
      let generatedQuestions = [];
      this.questions.forEach((item) => {
        if (item.type == this.type) {
          array.push(item);
        }
      });

      let count = 0;

      if (this.type == "experience") {
        this.questionsCount = 15;
        array.forEach((item) => {
          if (item.required) generatedQuestions.push(item);
        });
      } else {
        this.questionsCount = 25;
      }

      while (count < this.questionsCount) {
        const random = Math.floor(Math.random() * array.length);
        if (!generatedQuestions.includes(array[random])) {
          generatedQuestions.push(array[random]);
          // array[random].id = count + 1;
          count++;
        }
      }

      return generatedQuestions;
    },

    answerChosen() {
      if (this.test[this.currentQuestion].multiple) {
        let array = [];
        this.test[this.currentQuestion].answers.forEach((item) => {
          if (item.correct) {
            array.push(item);
          }
        });

        if (this.chosenAnswers.length == array.length) {
          return false;
        } else {
          return true;
        }
      } else if (this.chosenAnswer || this.gap) {
        return false;
      } else {
        return true;
      }
    },
  },

  mounted() {
    setTimeout(() => {
      document.querySelector("body").classList.add("loaded");
    }, 500);

    // window.localStorage.attemptCount = 0;
    // console.log(window.localStorage.attemptCount)
  },

  methods: {
    handleSelect({ id }) {
      const { treeselect } = this.$refs;
      const node = treeselect.getNode(id);
      let newValue;
      const { parentNode } = node;
      if (parentNode.parentNode)
        newValue = [parentNode.parentNode.id, parentNode.id, id];
      else {
        newValue = [parentNode.id, id];
      }
      treeselect.traverseDescendantsBFS(node, (descendant) => {
        newValue.push(descendant.id);
      });

      if (newValue)
        setTimeout(() => {
          this.user.from = newValue;
          this.user.from.length >= 2
            ? (this.fromValid = false)
            : (this.fromValid = true);
        });
    },

    handleClose({ id }) {
      this.user.from.length >= 2
        ? (this.fromValid = false)
        : (this.fromValid = true);
    },

    startTest() {
      this.testStarted = true;
    },

    startSection() {
      this.sectionStarted = true;
      this.sectionNumber++;
      this.timeStarted = true;
      if (this.sectionNumber == 3) this.countdown(14);
      else if (this.sectionNumber == 2) this.countdown(10);
      else this.countdown(6);
    },

    nextQuestion() {
      let userAnswer = [];

      if (this.test[this.currentQuestion].word) {
        this.test[this.currentQuestion].answers.forEach((item) => {
          if (item.text == this.gap) {
            this.correct = true;
            return;
          }
        });

        userAnswer = this.gap;
        this.gap = "";
      }

      if (this.correct) {
        this.scores[this.sectionNumber - 1].score += this.correct;
      }
      this.correct = 0;

      if (this.currentQuestion === this.test.length - 1) {
        if (this.sectionNumber > this.sections.length - 1) {
          this.finished = true;
          this.sectionStarted = false;

          let questionObject = {};

          if (this.test[this.currentQuestion].multiple)
            userAnswer = this.chosenAnswers;
          else if (!this.test[this.currentQuestion].word)
            userAnswer = this.chosenAnswer;

          questionObject.question = this.test[this.currentQuestion].question;
          questionObject.answer = userAnswer;
          questionObject.correct = [];
          this.test[this.currentQuestion].answers.forEach(function (item) {
            if (item.correct) questionObject.correct.push(item.text);
          });
          if (this.test[this.currentQuestion].word) {
            questionObject.correct.push(
              this.test[this.currentQuestion].answers[0].text
            );
          }

          this.userAnswers[this.sectionNumber - 1].answers.push(questionObject);
        } else {
          if (this.$refs.timer) this.$refs.timer.innerText = "";

          let questionObject = {};

          if (this.test[this.currentQuestion].multiple)
            userAnswer = this.chosenAnswers;
          else if (!this.test[this.currentQuestion].word)
            userAnswer = this.chosenAnswer;

          questionObject.question = this.test[this.currentQuestion].question;
          questionObject.answer = userAnswer;
          questionObject.correct = [];
          this.test[this.currentQuestion].answers.forEach(function (item) {
            if (item.correct) questionObject.correct.push(item.text);
          });
          if (this.test[this.currentQuestion].word) {
            questionObject.correct.push(
              this.test[this.currentQuestion].answers[0].text
            );
          }

          this.userAnswers[this.sectionNumber - 1].answers.push(questionObject);

          this.currentQuestion = 0;
          this.sectionStarted = false;
          this.timeStarted = false;
          this.type = this.sections[this.sectionNumber].type;
          this.section = this.sections[this.sectionNumber].title;
        }
      } else {
        let questionObject = {};

        if (this.test[this.currentQuestion].multiple)
          userAnswer = this.chosenAnswers;
        else if (!this.test[this.currentQuestion].word)
          userAnswer = this.chosenAnswer;

        questionObject.question = this.test[this.currentQuestion].question;
        questionObject.answer = userAnswer;
        questionObject.correct = [];
        this.test[this.currentQuestion].answers.forEach(function (item) {
          if (item.correct) questionObject.correct.push(item.text);
        });

        if (this.test[this.currentQuestion].word) {
          questionObject.correct.push(
            this.test[this.currentQuestion].answers[0].text
          );
        }

        this.userAnswers[this.sectionNumber - 1].answers.push(questionObject);

        this.currentQuestion++;
        this.chosenAnswer = false;
        this.chosenAnswers = [];
      }
    },

    makePdf() {
      let i = 0;
      let object = {};
      let experience = new Array(25);
      for (i = 0; i < experience.length; i++) {
        experience[i] = new Array(3);
      }

      let motivation = new Array(25);
      for (i = 0; i < motivation.length; i++) {
        motivation[i] = new Array(3);
      }

      let english = new Array(25);
      for (i = 0; i < english.length; i++) {
        english[i] = new Array(3);
      }

      let j = 0;
      this.userAnswers[0].answers.forEach(function (item) {
        object.text = item.question;
        object.fontSize = 15;
        object.margin = [0, 30];

        experience[j].push(object);

        object = {};

        object.text = item.answer;

        experience[j].push(object);

        object = {};

        object.text = item.correct;
        object.color = "green";

        experience[j].push(object);

        j++;
        object = {};
      });

      j = 0;

      this.userAnswers[1].answers.forEach(function (item) {
        object.text = item.question;
        object.fontSize = 15;
        object.margin = [0, 30];

        motivation[j].push(object);

        object = {};

        object.text = item.answer;

        motivation[j].push(object);

        object = {};

        object.text = item.correct;
        object.color = "green";

        motivation[j].push(object);

        j++;
        object = {};
      });

      j = 0;

      this.userAnswers[2].answers.forEach(function (item) {
        object.text = item.question;
        object.fontSize = 15;
        object.margin = [0, 30];

        english[j].push(object);

        object = {};

        object.text = item.answer;

        english[j].push(object);

        object = {};

        object.text = item.correct;
        object.color = "green";

        english[j].push(object);

        j++;
        object = {};
      });

      var docDefinition = {
        content: [
          {
            text:
              this.user.surname + " " + this.user.name + " " + this.user.email,
            fontSize: 13,
            color: "#ee394e",
          },
          { text: "Раздел ОПЫТ", fontSize: 20, margin: [0, 30] },

          experience,

          { text: "Раздел МОТИВАЦИЯ", fontSize: 20, margin: [0, 30] },

          motivation,

          {
            text: "Раздел НАВЫКИ АНГЛИЙСКОГО ЯЗЫКА",
            fontSize: 20,
            margin: [0, 30],
          },

          english,
        ],
      };

      // pdfMake.createPdf(docDefinition).open();

      var file;
      pdfMake.createPdf(docDefinition).getBase64((encodedString) => {
        file = encodedString;
        this.sendPDF(file);
      });
    },

    sendPDF(file) {
      const formData = new FormData();

      formData.append("pdf", file);
      formData.append("email", this.user.email);
      formData.append("name", this.user.name);
      formData.append("lastname", this.user.surname);

      axios
        .post("https://uk-work.ru/assets/php/pdf.php", formData)

        .then((response) => {
          console.log("success");
        })
        .catch((error) => {
          console.log(error.response);
        });
    },

    sendResult() {
      const formData = new FormData();

      formData.append("experience", this.scores[0].score);
      formData.append("motivation", this.scores[1].score);
      formData.append("english", this.scores[2].score);
      formData.append("email", this.user.email);

      axios
        .post("https://uk-work.ru/assets/php/result.php", formData)

        .then((response) => {
          console.log("success");
        })
        .catch((error) => {
          console.log(error.response);
        });
    },

    sendMailFromZoloterra() {
      const formData = new FormData();

      formData.append("surname", this.user.surname);
      formData.append("name", this.user.name);
      formData.append("patronymic", this.user.patronymic);
      formData.append("email", this.user.email);

      axios
        .post("https://uk-work.ru/assets/php/not-russian.php", formData)

        .then((response) => {
          console.log("success");
        })
        .catch((error) => {
          console.log(error.response);
        });
    },

    answerClick(correct) {
      if (correct) {
        this.correct = true;
      } else {
        this.correct = false;
      }
    },

    chosenItem(answer) {
      return this.chosenAnswers.indexOf(answer) + 1;
    },

    multipleClick(answer) {
      let array = [];
      this.test[this.currentQuestion].answers.forEach((item) => {
        if (item.correct) {
          array.push(item);
        }
      });

      setTimeout(() => {
        if (this.chosenAnswers.length == array.length) {
          for (var i = 0; i < array.length; i++) {
            if (this.chosenAnswers[i] != array[i].text) {
              this.correct = false;
              return false;
            } else {
              this.correct = true;
            }
          }
        } else if (this.chosenAnswers.length > array.length) {
          this.chosenAnswers.splice(0, 1);
          return false;
        }
      }, 5);
    },

    inputFocus(input) {
      this.focused = input;
    },
    inputBlur() {
      this.focused = 0;
    },
    register() {
      this.registrationStart = true;
      // this.testStarted = true
    },
    onInputPhone() {
      IMask(document.querySelector(".vti__input"), {
        mask: "+000000000000000",
      });
      setTimeout(() => {
        if (this.flag == 1) this.phoneValid = true;
      });
    },
    onValidatePhone({ isValid }) {
      if (this.flag) {
        this.phoneValid = !isValid;
        this.flag = 2;
      } else {
        this.flag = 1;
      }
    },

    checkForm() {
      /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i.test(
        this.user.email
      )
        ? (this.emailValid = false)
        : (this.emailValid = true);

      if (this.user.name.match("[a-zA-Zа-яА-Я]+")) {
        this.user.name.trim() !== "" &&
        this.user.name.length >= 2 &&
        this.user.name.match("[a-zA-Zа-яА-Я]+")[0] === this.user.name
          ? (this.nameValid = false)
          : (this.nameValid = true);
      } else this.nameValid = true;

      if (this.user.surname.match("[a-zA-Zа-яА-Я]+")) {
        this.user.surname.trim() !== "" &&
        this.user.surname.length >= 2 &&
        this.user.surname.match("[a-zA-Zа-яА-Я]+")[0] === this.user.surname
          ? (this.surnameValid = false)
          : (this.surnameValid = true);
      } else this.surnameValid = true;

      if (this.user.patronymic.match("[a-zA-Zа-яА-Я]+")) {
        this.user.patronymic.trim() !== "" &&
        this.user.patronymic.length >= 2 &&
        this.user.patronymic.match("[a-zA-Zа-яА-Я]+")[0] ===
          this.user.patronymic
          ? (this.patronymicValid = false)
          : (this.patronymicValid = true);
      } else this.patronymicValid = true;

      this.user.birthday.trim() !== "" && this.user.birthday.length >= 10
        ? (this.birthdayValid = false)
        : (this.birthdayValid = true);

      if (this.user.skype.match(/^[a-z][a-z0-9\.:\-_]+/)) {
        this.user.skype.match(/^[a-z][a-z0-9\.:\-_]+/)[0] === this.user.skype
          ? (this.skypeValid = false)
          : (this.skypeValid = true);
      } else this.skypeValid = true;

      if (this.user.phone.length < 5) this.phoneValid = true;

      this.user.from.length >= 2
        ? (this.fromValid = false)
        : (this.fromValid = true);

      if (this.user.student) {
        this.user.university.trim() !== "" && this.user.university.length >= 3
          ? (this.universityValid = false)
          : (this.universityValid = true);
      }

      this.agreement
        ? (this.agreementValid = false)
        : (this.agreementValid = true);

      if (
        !this.nameValid &&
        !this.surnameValid &&
        !this.patronymicValid &&
        !this.emailValid &&
        !this.birthdayValid &&
        !this.skypeValid &&
        !this.agreementValid &&
        !this.phoneValid &&
        !this.fromValid
      ) {
        this.checkResult = true;

        this.emailCode = Math.random().toString(36).substr(2, 5);
        window.localStorage.securityCode = this.emailCode;

        const formData = new FormData();

        formData.append("code", this.emailCode);
        formData.append("email", this.user.email);

        setTimeout(function () {
          axios
            .post("https://uk-work.ru/assets/php/post.php", formData)

            .then((response) => {
              console.log("success");
            })
            .catch((error) => {
              console.log("error");
            });
        }, 500);

        this.checkEmail();
      }
      return this.checkResult;
    },

    repeatEmail() {
      this.emailCode = Math.random().toString(36).substr(2, 5);
      window.localStorage.securityCode = this.emailCode;

      const formData = new FormData();

      formData.append("code", this.emailCode);
      formData.append("email", this.user.email);

      axios
        .post("https://uk-work.ru/assets/php/post.php", formData)

        .then((response) => {
          console.log("success");
        })
        .catch((error) => {
          console.log("error");
        });
    },

    checkEmail() {
      this.securityCode = 1;
      this.registrationStart = 0;
    },

    confirmEmail() {
      if (this.user.code == window.localStorage.securityCode) {
        this.confirmationResult = true;
        this.securityCode = 0;
        this.codeValid = false;

        if (!window.localStorage.attemptCount)
          window.localStorage.attemptCount = 1;
        else window.localStorage.attemptCount++;

        if (window.localStorage.attemptCount > 2) {
          this.noAttempts = 1;
          this.testIntro = false;
        } else {
          this.testStarted = 1;
        }
      } else {
        this.codeValid = true;
      }

      return this.confirmationResult;
    },

    backToRegistration() {
      this.securityCode = false;
      this.registrationStart = true;
      this.codeValid = false;
      this.user.code = "";
    },

    sendData() {
      this.loading = true;

      this.scores.forEach((item) => {
        item.score = Math.round((item.score / this.questionsCount) * 100) + "%";
      });
      // $.ajax({

      // 	url: "https://zoloterra.t8s.ru/Api/V2/AddStudyRequest",
      // 	data: {
      // 		fullName: "Иванов Иван Иванович",
      // 	},
      // 	contentType: "application/x-www-form-urlencoded",
      // 	type: "POST",
      // 	success: function (result) {
      //     this.showScores = true;
      //     this.makePdf();
      // 	},
      // 	error: function (jqXhr) {
      // 		try {
      // 			alert("Ошибка: " + $.parseJSON(jqXhr.responseText).Error);

      // 		} catch (e) {
      // 			console.log(jqXhr)
      // 			alert("1Ошибка: " + jqXhr.statusText + " (" + jqXhr.readyState + ", " + jqXhr.status + ", " + jqXhr.responseText + ")");
      // 		}
      // 	}
      // });

      const formData = new FormData();

      formData.append(
        "fullName",
        this.user.surname + " " + this.user.name + " " + this.user.patronymic
      );
      formData.append("type", "SWP Тест");
      formData.append("eMail", this.user.email);
      formData.append("Skype", this.user.skype);
      formData.append("birthday", this.user.birthday);
      formData.append("phone", this.user.phone);
      formData.append(
        "description",
        this.user.student +
          " " +
          this.user.university +
          "  Страна: " +
          this.user.from[0] +
          "  Регион: " +
          this.user.from[1] +
          "  Город: " +
          this.user.from[2] +
          "  Skype: " +
          this.user.skype
      );
      formData.append("discipline", "Английский");
      formData.append("maturity", "SWP");
      formData.append("office", "SWP");
      formData.append(
        "extraFields",
        JSON.stringify({
          "1_experience": this.scores[0].score,
          "2_motivation": this.scores[1].score,
          "3_english": this.scores[2].score,
          "Заинтересован(а) в прохождении курса SWP":
            this.user.course === "yes" ? "True" : "False",
        })
      );

      axios
        .post("https://zoloterra.t8s.ru/Api/V2/AddStudyRequest", formData)
        .then((response) => {
          console.log("success");
          this.showScores = true;
          this.sendResult();
          if (this.user.from[0] !== "Россия" && this.user.course === "yes")
            this.sendMailFromZoloterra();
        })
        .catch((error) => {
          console.log(error.response);
        });

      this.makePdf();
    },

    countdown(duration) {
      const timeToEnd = new Date().getTime() + duration * 60 * 1000;

      function getRemainingTime(deadline) {
        const currentTime = new Date().getTime();
        return deadline - currentTime;
      }

      function pad(value) {
        return ("0" + Math.floor(value)).slice(-2);
      }

      let showTime = () => {
        const remainingTime = getRemainingTime(timeToEnd);
        const seconds = pad((remainingTime / 1000) % 60);
        const minutes = pad((remainingTime / (60 * 1000)) % 60);

        if (this.$refs.timer)
          this.$refs.timer.innerText = `${minutes}:${seconds}`;

        if (remainingTime >= 1000 && this.timeStarted) {
          requestAnimationFrame(showTime);
        } else if (this.timeStarted) {
          this.currentQuestion = 0;
          this.sectionStarted = false;
          this.timeStarted = false;
          if (this.$refs.timer) this.$refs.timer.innerText = "";

          if (this.sectionNumber > this.sections.length - 1) {
            this.finished = true;
            this.sectionStarted = false;
          } else {
            this.type = this.sections[this.sectionNumber].type;
            this.section = this.sections[this.sectionNumber].title;
          }
        }
      };

      requestAnimationFrame(showTime);
    },
  },
  data() {
    return {
      flag: false,
      currentQuestion: 0,
      scores: [
        {
          score: 0,
        },
        {
          score: 0,
        },
        {
          score: 0,
        },
      ],
      sections: [
        {
          title: "ОПЫТ",
          type: "experience",
        },
        {
          title: "МОТИВАЦИЯ",
          type: "motivation",
        },
        {
          title: "НАВЫКИ АНГЛИЙСКОГО ЯЗЫКА",
          type: "english",
        },
      ],
      sectionNumber: 0,
      section: "ОПЫТ",
      correct: 0,
      type: "experience",
      testStarted: false,
      testIntro: true,
      sectionStarted: false,
      finished: false,
      chosenAnswer: false,
      chosenAnswers: [],
      questionsCount: 25,
      gap: "",
      endTime: "",
      timeStarted: false,
      registrationStart: false,
      emailChecking: false,
      courseInfo: 0,
      familiarized: "",
      focused: 0,
      isStudent: false,
      checkResult: false,
      confirmationResult: false,
      loading: false,
      user: {
        name: "",
        surname: "",
        patronymic: "",
        birthday: "",
        from: [],
        phone: "",
        email: "",
        skype: "",
        student: "",
        university: "",
        course: "",
        code: "",
      },
      userAnswers: [
        {
          answers: [],
        },
        {
          answers: [],
        },
        {
          answers: [],
        },
      ],
      questionObject: {
        question: "",
        answer: "",
        correc: "",
      },
      emailValid: false,
      phoneValid: false,
      nameValid: false,
      surnameValid: false,
      patronymicValid: false,
      birthdayValid: false,
      fromValid: false,
      skypeValid: false,
      agreementValid: false,
      universityValid: false,
      agreement: false,
      codeValid: false,
      bindProps: {
        validCharactersOnly: true,
        required: true,
        dynamicPlaceholder: true,
        // enabledCountryCode: true,
        mode: "international",
        // autoDefaultCountry: false,
        autoFormat: false,
        onlyCountries: [
          "AM",
          "UZ",
          "MD",
          "TJ",
          "AZ",
          "KZ",
          "KG",
          "BY",
          "RU",
          "TM",
        ],
        inputOptions: {
          showDialCode: false,
          autocomplete: "off",
          name: "phone",
          id: "phoneMask",
        },
      },
      showScores: false,
      securityCode: 0,
      emailCode: "",
      attemptCount: 0,
      noAttempts: 0,
      valueConsistsOf: "ALL_WITH_INDETERMINATE",
      closeOnSelect: true,
      clearOnSelect: true,

      options: [
        {
          id: "Россия",
          label: "Россия",

          children: [
            {
              id: "Адыгея",
              label: "Адыгея",

              children: [
                {
                  id: "Адыгейск",
                  label: "Адыгейск",
                },
                {
                  id: "Майкоп",
                  label: "Майкоп",
                },
              ],
            },
            {
              id: "Алтай",
              label: "Алтай",

              children: [
                {
                  id: "Горно-Алтайск",
                  label: "Горно-Алтайск",
                },
              ],
            },
            {
              id: "Алтайский край",
              label: "Алтайский край",

              children: [
                {
                  id: "Алейск",
                  label: "Алейск",
                },
                {
                  id: "Барнаул",
                  label: "Барнаул",
                },
                {
                  id: "Белокуриха",
                  label: "Белокуриха",
                },
                {
                  id: "Бийск",
                  label: "Бийск",
                },
                {
                  id: "Горняк",
                  label: "Горняк",
                },
                {
                  id: "Заринск",
                  label: "Заринск",
                },
                {
                  id: "Змеиногорск",
                  label: "Змеиногорск",
                },
                {
                  id: "Камень-на-Оби",
                  label: "Камень-на-Оби",
                },
                {
                  id: "Новоалтайск",
                  label: "Новоалтайск",
                },
                {
                  id: "Рубцовск",
                  label: "Рубцовск",
                },
                {
                  id: "Славгород",
                  label: "Славгород",
                },
                {
                  id: "Яровое",
                  label: "Яровое",
                },
              ],
            },
            {
              id: "Амурская область",
              label: "Амурская область",

              children: [
                {
                  id: "Белогорск",
                  label: "Белогорск",
                },
                {
                  id: "Благовещенск",
                  label: "Благовещенск",
                },
                {
                  id: "Завитинск",
                  label: "Завитинск",
                },
                {
                  id: "Зея",
                  label: "Зея",
                },
                {
                  id: "Райчихинск",
                  label: "Райчихинск",
                },
                {
                  id: "Свободный",
                  label: "Свободный",
                },
                {
                  id: "Сковородино",
                  label: "Сковородино",
                },
                {
                  id: "Тында",
                  label: "Тында",
                },
                {
                  id: "Шимановск",
                  label: "Шимановск",
                },
              ],
            },
            {
              id: "Архангельская область",
              label: "Архангельская область",

              children: [
                {
                  id: "Архангельск",
                  label: "Архангельск",
                },
                {
                  id: "Вельск",
                  label: "Вельск",
                },
                {
                  id: "Каргополь",
                  label: "Каргополь",
                },
                {
                  id: "Коряжма",
                  label: "Коряжма",
                },
                {
                  id: "Котлас",
                  label: "Котлас",
                },
                {
                  id: "Мезень",
                  label: "Мезень",
                },
                {
                  id: "Мирный",
                  label: "Мирный",
                },
                {
                  id: "Новодвинск",
                  label: "Новодвинск",
                },
                {
                  id: "Няндома",
                  label: "Няндома",
                },
                {
                  id: "Онега",
                  label: "Онега",
                },
                {
                  id: "Северодвинск",
                  label: "Северодвинск",
                },
                {
                  id: "Сольвычегодск",
                  label: "Сольвычегодск",
                },
                {
                  id: "Шенкурск",
                  label: "Шенкурск",
                },
              ],
            },
            {
              id: "Астраханская область",
              label: "Астраханская область",

              children: [
                {
                  id: "Астрахань",
                  label: "Астрахань",
                },
                {
                  id: "Ахтубинск",
                  label: "Ахтубинск",
                },
                {
                  id: "Каргополь",
                  label: "Каргополь",
                },
                {
                  id: "Знаменск",
                  label: "Знаменск",
                },
                {
                  id: "Камызяк",
                  label: "Камызяк",
                },
                {
                  id: "Нариманов",
                  label: "Нариманов",
                },
                {
                  id: "Харабали",
                  label: "Харабали",
                },
              ],
            },
            {
              id: "Башкортостан",
              label: "Башкортостан",

              children: [
                {
                  id: "Агидель",
                  label: "Агидель",
                },
                {
                  id: "Баймак",
                  label: "Баймак",
                },
                {
                  id: "Белебей",
                  label: "Белебей",
                },
                {
                  id: "Белорецк",
                  label: "Белорецк",
                },
                {
                  id: "Бирск",
                  label: "Бирск",
                },
                {
                  id: "Благовещенск",
                  label: "Благовещенск",
                },
                {
                  id: "Давлеканово",
                  label: "Давлеканово",
                },
                {
                  id: "Дюртюли",
                  label: "Дюртюли",
                },
                {
                  id: "Ишимбай",
                  label: "Ишимбай",
                },
                {
                  id: "Кумертау",
                  label: "Кумертау",
                },
                {
                  id: "Межгорье",
                  label: "Межгорье",
                },
                {
                  id: "Мелеуз",
                  label: "Мелеуз",
                },
                {
                  id: "Нефтекамск",
                  label: "Нефтекамск",
                },
                {
                  id: "Октябрьский",
                  label: "Октябрьский",
                },
                {
                  id: "Салават",
                  label: "Салават",
                },
                {
                  id: "Сибай",
                  label: "Сибай",
                },
                {
                  id: "Стерлитамак",
                  label: "Стерлитамак",
                },
                {
                  id: "Туймазы",
                  label: "Туймазы",
                },
                {
                  id: "Уфа",
                  label: "Уфа",
                },
                {
                  id: "Учалы",
                  label: "Учалы",
                },
                {
                  id: "Янаул",
                  label: "Янаул",
                },
              ],
            },
            {
              id: "Белгородская область",
              label: "Белгородская область",

              children: [
                {
                  id: "Алексеевка",
                  label: "Алексеевка",
                },
                {
                  id: "Белгород",
                  label: "Белгород",
                },
                {
                  id: "Бирюч",
                  label: "Бирюч",
                },
                {
                  id: "Валуйки",
                  label: "Валуйки",
                },
                {
                  id: "Грайворон",
                  label: "Грайворон",
                },
                {
                  id: "Губкин",
                  label: "Губкин",
                },
                {
                  id: "Короча",
                  label: "Короча",
                },
                {
                  id: "Новый Оскол",
                  label: "Новый Оскол",
                },
                {
                  id: "Старый Оскол",
                  label: "Старый Оскол",
                },
                {
                  id: "Шебекино",
                  label: "Шебекино",
                },
              ],
            },
            {
              id: "Брянская область",
              label: "Брянская область",

              children: [
                {
                  id: "Брянск",
                  label: "Брянск",
                },
                {
                  id: "Жуковка",
                  label: "Жуковка",
                },
                {
                  id: "Злынка",
                  label: "Злынка",
                },
                {
                  id: "Карачев",
                  label: "Карачев",
                },
                {
                  id: "Клинцы",
                  label: "Клинцы",
                },
                {
                  id: "Мглин",
                  label: "Мглин",
                },
                {
                  id: "Новозыбков",
                  label: "Новозыбков",
                },
                {
                  id: "Почеп",
                  label: "Почеп",
                },
                {
                  id: "Севск",
                  label: "Севск",
                },
                {
                  id: "Сельцо",
                  label: "Сельцо",
                },
                {
                  id: "Стародуб",
                  label: "Стародуб",
                },
                {
                  id: "Сураж",
                  label: "Сураж",
                },
                {
                  id: "Трубчевск",
                  label: "Трубчевск",
                },
                {
                  id: "Унеча",
                  label: "Унеча",
                },
                {
                  id: "Фокино",
                  label: "Фокино",
                },
              ],
            },
            {
              id: "Бурятия",
              label: "Бурятия",

              children: [
                {
                  id: "Бабушкин",
                  label: "Бабушкин",
                },
                {
                  id: "Гусиноозёрск",
                  label: "Гусиноозёрск",
                },
                {
                  id: "Закаменск",
                  label: "Закаменск",
                },
                {
                  id: "Кяхта",
                  label: "Кяхта",
                },
                {
                  id: "Северобайкальск",
                  label: "Северобайкальск",
                },
                {
                  id: "Улан-Удэ",
                  label: "Улан-Удэ",
                },
              ],
            },
            {
              id: "Владимирская область",
              label: "Владимирская область",

              children: [
                {
                  id: "Александров",
                  label: "Александров",
                },
                {
                  id: "Владимир",
                  label: "Владимир",
                },
                {
                  id: "Вязники",
                  label: "Вязники",
                },
                {
                  id: "Гороховец",
                  label: "Гороховец",
                },
                {
                  id: "Гусь-Хрустальный",
                  label: "Гусь-Хрустальный",
                },
                {
                  id: "Камешково",
                  label: "Камешково",
                },
                {
                  id: "Карабаново",
                  label: "Карабаново",
                },
                {
                  id: "Киржач",
                  label: "Киржач",
                },
                {
                  id: "Кольчугино",
                  label: "Кольчугино",
                },
                {
                  id: "Костерёво",
                  label: "Костерёво",
                },
                {
                  id: "Курлово",
                  label: "Курлово",
                },
                {
                  id: "Лакинск",
                  label: "Лакинск",
                },
                {
                  id: "Меленки",
                  label: "Меленки",
                },
                {
                  id: "Муром",
                  label: "Муром",
                },
                {
                  id: "Петушки",
                  label: "Петушки",
                },
                {
                  id: "Покров",
                  label: "Покров",
                },
                {
                  id: "Радужный",
                  label: "Радужный",
                },
                {
                  id: "Собинка",
                  label: "Собинка",
                },
                {
                  id: "Струнино",
                  label: "Струнино",
                },
                {
                  id: "Судогда",
                  label: "Судогда",
                },
                {
                  id: "Суздаль",
                  label: "Суздаль",
                },
                {
                  id: "Юрьев-Польский",
                  label: "Юрьев-Польский",
                },
              ],
            },
            {
              id: "Волгоградская область",
              label: "Волгоградская область",

              children: [
                {
                  id: "Волгоград",
                  label: "Волгоград",
                },
                {
                  id: "Волжский",
                  label: "Волжский",
                },
                {
                  id: "Дубовка",
                  label: "Дубовка",
                },
                {
                  id: "Жирновск",
                  label: "Жирновск",
                },
                {
                  id: "Калач-на-Дону",
                  label: "Калач-на-Дону",
                },
                {
                  id: "Камышин",
                  label: "Камышин",
                },
                {
                  id: "Котельниково",
                  label: "Котельниково",
                },
                {
                  id: "Котово",
                  label: "Котово",
                },
                {
                  id: "Краснослободск",
                  label: "Краснослободск",
                },
                {
                  id: "Ленинск",
                  label: "Ленинск",
                },
                {
                  id: "Михайловка",
                  label: "Михайловка",
                },
                {
                  id: "Николаевск",
                  label: "Николаевск",
                },
                {
                  id: "Новоаннинский",
                  label: "Новоаннинский",
                },
                {
                  id: "Палласовка",
                  label: "Палласовка",
                },
                {
                  id: "ПетровВал",
                  label: "ПетровВал",
                },
                {
                  id: "Серафимович",
                  label: "Серафимович",
                },
                {
                  id: "Суровикино",
                  label: "Суровикино",
                },
                {
                  id: "Урюпинск",
                  label: "Урюпинск",
                },
                {
                  id: "Фролово",
                  label: "Фролово",
                },
              ],
            },
            {
              id: "Вологодская область",
              label: "Вологодская область",

              children: [
                {
                  id: "Бабаево",
                  label: "Бабаево",
                },
                {
                  id: "Белозерск",
                  label: "Белозерск",
                },
                {
                  id: "Великий Устюг",
                  label: "Великий Устюг",
                },
                {
                  id: "Вологда",
                  label: "Вологда",
                },
                {
                  id: "Вытегра",
                  label: "Вытегра",
                },
                {
                  id: "Грязовец",
                  label: "Грязовец",
                },
                {
                  id: "Кадников",
                  label: "Кадников",
                },
                {
                  id: "Кириллов",
                  label: "Кириллов",
                },
                {
                  id: "Красавино",
                  label: "Красавино",
                },
                {
                  id: "Никольск",
                  label: "Никольск",
                },
                {
                  id: "Сокол",
                  label: "Сокол",
                },
                {
                  id: "Тотьма",
                  label: "Тотьма",
                },
                {
                  id: "Устюжна",
                  label: "Устюжна",
                },
                {
                  id: "Харовск",
                  label: "Харовск",
                },
                {
                  id: "Череповец",
                  label: "Череповец",
                },
              ],
            },
            {
              id: "Воронежская область",
              label: "Воронежская область",

              children: [
                {
                  id: "Бобров",
                  label: "Бобров",
                },
                {
                  id: "Богучар",
                  label: "Богучар",
                },
                {
                  id: "Борисоглебск",
                  label: "Борисоглебск",
                },
                {
                  id: "Бутурлиновка",
                  label: "Бутурлиновка",
                },
                {
                  id: "Воронеж",
                  label: "Воронеж",
                },
                {
                  id: "Калач",
                  label: "Калач",
                },
                {
                  id: "Лиски",
                  label: "Лиски",
                },
                {
                  id: "Нововоронеж",
                  label: "Нововоронеж",
                },
                {
                  id: "Новохопёрск",
                  label: "Новохопёрск",
                },
                {
                  id: "Острогожск",
                  label: "Острогожск",
                },
                {
                  id: "Павловск",
                  label: "Павловск",
                },
                {
                  id: "Поворино",
                  label: "Поворино",
                },
                {
                  id: "Россошь",
                  label: "Россошь",
                },
                {
                  id: "Семилуки",
                  label: "Семилуки",
                },
                {
                  id: "Эртиль",
                  label: "Эртиль",
                },
              ],
            },
            {
              id: "Дагестан",
              label: "Дагестан",

              children: [
                {
                  id: "Буйнакск",
                  label: "Буйнакск",
                },
                {
                  id: "Дагестанские Огни",
                  label: "Дагестанские Огни",
                },
                {
                  id: "Дербент",
                  label: "Дербент",
                },
                {
                  id: "Избербаш",
                  label: "Избербаш",
                },
                {
                  id: "Каспийск",
                  label: "Каспийск",
                },
                {
                  id: "Кизилюрт",
                  label: "Кизилюрт",
                },
                {
                  id: "Кизляр",
                  label: "Кизляр",
                },
                {
                  id: "Махачкала",
                  label: "Махачкала",
                },
                {
                  id: "Хасавюрт",
                  label: "Хасавюрт",
                },
                {
                  id: "Южно-Сухокумск",
                  label: "Южно-Сухокумск",
                },
              ],
            },
            {
              id: "Еврейская АО",
              label: "Еврейская АО",

              children: [
                {
                  id: "Биробиджан",
                  label: "Биробиджан",
                },
                {
                  id: "Облучье",
                  label: "Облучье",
                },
              ],
            },
            {
              id: "Забайкальский край",
              label: "Забайкальский край",

              children: [
                {
                  id: "Балей",
                  label: "Балей",
                },
                {
                  id: "Борзя",
                  label: "Борзя",
                },
                {
                  id: "Краснокаменск",
                  label: "Краснокаменск",
                },
                {
                  id: "Могоча",
                  label: "Могоча",
                },
                {
                  id: "Нерчинск",
                  label: "Нерчинск",
                },
                {
                  id: "Петровск-Забайкальский",
                  label: "Петровск-Забайкальский",
                },
                {
                  id: "Сретенск",
                  label: "Сретенск",
                },
                {
                  id: "Хилок",
                  label: "Хилок",
                },
                {
                  id: "Чита",
                  label: "Чита",
                },
              ],
            },
            {
              id: "Ивановская область",
              label: "Ивановская область",

              children: [
                {
                  id: "Вичуга",
                  label: "Вичуга",
                },
                {
                  id: "Гаврилов Посад",
                  label: "Гаврилов Посад",
                },
                {
                  id: "Заволжск",
                  label: "Заволжск",
                },
                {
                  id: "Иваново",
                  label: "Иваново",
                },
                {
                  id: "Кинешма",
                  label: "Кинешма",
                },
                {
                  id: "Комсомольск",
                  label: "Комсомольск",
                },
                {
                  id: "Кохма",
                  label: "Кохма",
                },
                {
                  id: "Наволоки",
                  label: "Наволоки",
                },
                {
                  id: "Плёс",
                  label: "Плёс",
                },
                {
                  id: "Приволжск",
                  label: "Приволжск",
                },
                {
                  id: "Пучеж",
                  label: "Пучеж",
                },
                {
                  id: "Родники",
                  label: "Родники",
                },
                {
                  id: "Тейково",
                  label: "Тейково",
                },
                {
                  id: "Фурманов",
                  label: "Фурманов",
                },
                {
                  id: "Шуя",
                  label: "Шуя",
                },
                {
                  id: "Южа",
                  label: "Южа",
                },
                {
                  id: "Юрьевец",
                  label: "Юрьевец",
                },
              ],
            },
            {
              id: "Ингушетия",
              label: "Ингушетия",

              children: [
                {
                  id: "Карабулак",
                  label: "Карабулак",
                },
                {
                  id: "Магас",
                  label: "Магас",
                },
                {
                  id: "Малгобек",
                  label: "Малгобек",
                },
                {
                  id: "Назрань",
                  label: "Назрань",
                },
                {
                  id: "Сунжа",
                  label: "Сунжа",
                },
              ],
            },
            {
              id: "Иркутская область",
              label: "Иркутская область",

              children: [
                {
                  id: "Алзамай",
                  label: "Алзамай",
                },
                {
                  id: "Ангарск",
                  label: "Ангарск",
                },
                {
                  id: "Байкальск",
                  label: "Байкальск",
                },
                {
                  id: "Бирюсинск",
                  label: "Бирюсинск",
                },
                {
                  id: "Братск",
                  label: "Братск",
                },
                {
                  id: "Вихоревка",
                  label: "Вихоревка",
                },
                {
                  id: "Железногорск-Илимский",
                  label: "Железногорск-Илимский",
                },
                {
                  id: "Зима",
                  label: "Зима",
                },
                {
                  id: "Иркутск",
                  label: "Иркутск",
                },
                {
                  id: "Киренск",
                  label: "Киренск",
                },
                {
                  id: "Нижнеудинск",
                  label: "Нижнеудинск",
                },
                {
                  id: "Саянск",
                  label: "Саянск",
                },
                {
                  id: "Свирск",
                  label: "Свирск",
                },
                {
                  id: "Слюдянка",
                  label: "Слюдянка",
                },
                {
                  id: "Тайшет",
                  label: "Тайшет",
                },
                {
                  id: "Усолье-Сибирское",
                  label: "Усолье-Сибирское",
                },
                {
                  id: "Усть-Илимск",
                  label: "Усть-Илимск",
                },
                {
                  id: "Усть-Кут",
                  label: "Усть-Кут",
                },
                {
                  id: "Черемхово",
                  label: "Черемхово",
                },
                {
                  id: "Шелехов",
                  label: "Шелехов",
                },
              ],
            },
            {
              id: "Кабардино-Балкария",
              label: "Кабардино-Балкария",

              children: [
                {
                  id: "Баксан",
                  label: "Баксан",
                },
                {
                  id: "Майский",
                  label: "Майский",
                },
                {
                  id: "Нальчик",
                  label: "Нальчик",
                },
                {
                  id: "Нарткала",
                  label: "Нарткала",
                },
                {
                  id: "Прохладный",
                  label: "Прохладный",
                },
                {
                  id: "Терек",
                  label: "Терек",
                },
                {
                  id: "Тырныауз",
                  label: "Тырныауз",
                },
                {
                  id: "Чегем",
                  label: "Чегем",
                },
              ],
            },
            {
              id: "Калининградская область",
              label: "Калининградская область",

              children: [
                {
                  id: "Багратионовск",
                  label: "Багратионовск",
                },
                {
                  id: "Балтийск",
                  label: "Балтийск",
                },
                {
                  id: "Гвардейск",
                  label: "Гвардейск",
                },
                {
                  id: "Гурьевск",
                  label: "Гурьевск",
                },
                {
                  id: "Гусев",
                  label: "Гусев",
                },
                {
                  id: "Зеленоградск",
                  label: "Зеленоградск",
                },
                {
                  id: "Калининград",
                  label: "Калининград",
                },
                {
                  id: "Краснознаменск",
                  label: "Краснознаменск",
                },
                {
                  id: "Ладушкин",
                  label: "Ладушкин",
                },
                {
                  id: "Мамоново",
                  label: "Мамоново",
                },
                {
                  id: "Неман",
                  label: "Неман",
                },
                {
                  id: "Нестеров",
                  label: "Нестеров",
                },
                {
                  id: "Озёрск1",
                  label: "Озёрск",
                },
                {
                  id: "Пионерский",
                  label: "Пионерский",
                },
                {
                  id: "Полесск",
                  label: "Полесск",
                },
                {
                  id: "Правдинск",
                  label: "Правдинск",
                },
                {
                  id: "Приморск",
                  label: "Приморск",
                },
                {
                  id: "Светлогорск",
                  label: "Светлогорск",
                },
                {
                  id: "Светлый",
                  label: "Светлый",
                },
                {
                  id: "Славск",
                  label: "Славск",
                },
                {
                  id: "Советск",
                  label: "Советск",
                },
                {
                  id: "Черняховск",
                  label: "Черняховск",
                },
              ],
            },
            {
              id: "Калмыкия",
              label: "Калмыкия",

              children: [
                {
                  id: "Городовиковск",
                  label: "Городовиковск",
                },
                {
                  id: "Лагань",
                  label: "Лагань",
                },
                {
                  id: "Элиста",
                  label: "Элиста",
                },
              ],
            },
            {
              id: "Калужская область",
              label: "Калужская область",

              children: [
                {
                  id: "Балабаново",
                  label: "Балабаново",
                },
                {
                  id: "Белоусово",
                  label: "Белоусово",
                },
                {
                  id: "Боровск",
                  label: "Боровск",
                },
                {
                  id: "Ермолино",
                  label: "Ермолино",
                },
                {
                  id: "Жиздра",
                  label: "Жиздра",
                },
                {
                  id: "Жуков",
                  label: "Жуков",
                },
                {
                  id: "Калуга",
                  label: "Калуга",
                },
                {
                  id: "Киров",
                  label: "Киров",
                },
                {
                  id: "Козельск",
                  label: "Козельск",
                },
                {
                  id: "Кондрово",
                  label: "Кондрово",
                },
                {
                  id: "Кремёнки",
                  label: "Кремёнки",
                },
                {
                  id: "Людиново",
                  label: "Людиново",
                },
                {
                  id: "Малоярославец",
                  label: "Малоярославец",
                },
                {
                  id: "Медынь",
                  label: "Медынь",
                },
                {
                  id: "Мещовск",
                  label: "Мещовск",
                },
                {
                  id: "Мосальск",
                  label: "Мосальск",
                },
                {
                  id: "Обнинск",
                  label: "Обнинск",
                },
                {
                  id: "Сосенский",
                  label: "Сосенский",
                },
                {
                  id: "Спас-Деменск",
                  label: "Спас-Деменск",
                },
                {
                  id: "Сухиничи",
                  label: "Сухиничи",
                },
                {
                  id: "Таруса",
                  label: "Таруса",
                },
                {
                  id: "Юхнов",
                  label: "Юхнов",
                },
              ],
            },
            {
              id: "Камчатский край",
              label: "Камчатский край",

              children: [
                {
                  id: "Вилючинск",
                  label: "Вилючинск",
                },
                {
                  id: "Елизово",
                  label: "Елизово",
                },
                {
                  id: "Петропавловск-Камчатский",
                  label: "Петропавловск-Камчатский",
                },
              ],
            },
            {
              id: "Карачаево-Черкесия",
              label: "Карачаево-Черкесия",

              children: [
                {
                  id: "Карачаевск",
                  label: "Карачаевск",
                },
                {
                  id: "Теберда",
                  label: "Теберда",
                },
                {
                  id: "Усть-Джегута",
                  label: "Усть-Джегута",
                },
                {
                  id: "Черкесск",
                  label: "Черкесск",
                },
              ],
            },
            {
              id: "Карелия",
              label: "Карелия",

              children: [
                {
                  id: "Беломорск",
                  label: "Беломорск",
                },
                {
                  id: "Кемь",
                  label: "Кемь",
                },
                {
                  id: "Кондопога",
                  label: "Кондопога",
                },
                {
                  id: "Костомукша",
                  label: "Костомукша",
                },
                {
                  id: "Лахденпохья",
                  label: "Лахденпохья",
                },
                {
                  id: "Медвежьегорск",
                  label: "Медвежьегорск",
                },
                {
                  id: "Олонец",
                  label: "Олонец",
                },
                {
                  id: "Петрозаводск",
                  label: "Петрозаводск",
                },
                {
                  id: "Питкяранта",
                  label: "Питкяранта",
                },
                {
                  id: "Пудож",
                  label: "Пудож",
                },
                {
                  id: "Сегежа",
                  label: "Сегежа",
                },
                {
                  id: "Сортавала",
                  label: "Сортавала",
                },
                {
                  id: "Суоярви",
                  label: "Суоярви",
                },
              ],
            },
            {
              id: "Кемеровская область",
              label: "Кемеровская область",

              children: [
                {
                  id: "Анжеро-Судженск",
                  label: "Анжеро-Судженск",
                },
                {
                  id: "Белово",
                  label: "Белово",
                },
                {
                  id: "Берёзовский",
                  label: "Берёзовский",
                },
                {
                  id: "Гурьевск",
                  label: "Гурьевск",
                },
                {
                  id: "Калтан",
                  label: "Калтан",
                },
                {
                  id: "Кемерово",
                  label: "Кемерово",
                },
                {
                  id: "Киселёвск",
                  label: "Киселёвск",
                },
                {
                  id: "Ленинск-Кузнецкий",
                  label: "Ленинск-Кузнецкий",
                },
                {
                  id: "Мариинск",
                  label: "Мариинск",
                },
                {
                  id: "Междуреченск",
                  label: "Междуреченск",
                },
                {
                  id: "Мыски",
                  label: "Мыски",
                },
                {
                  id: "Новокузнецк",
                  label: "Новокузнецк",
                },
                {
                  id: "Осинники",
                  label: "Осинники",
                },
                {
                  id: "Полысаево",
                  label: "Полысаево",
                },
                {
                  id: "Прокопьевск",
                  label: "Прокопьевск",
                },
                {
                  id: "Салаир",
                  label: "Салаир",
                },
                {
                  id: "Тайга",
                  label: "Тайга",
                },
                {
                  id: "Таштагол",
                  label: "Таштагол",
                },
                {
                  id: "Топки",
                  label: "Топки",
                },
                {
                  id: "Юрга",
                  label: "Юрга",
                },
              ],
            },
            {
              id: "Кировская область",
              label: "Кировская область",

              children: [
                {
                  id: "Белая Холуница",
                  label: "Белая Холуница",
                },
                {
                  id: "Вятские Поляны",
                  label: "Вятские Поляны",
                },
                {
                  id: "Зуевка",
                  label: "Зуевка",
                },
                {
                  id: "Киров",
                  label: "Киров",
                },
                {
                  id: "Кирово-Чепецк",
                  label: "Кирово-Чепецк",
                },
                {
                  id: "Кирс",
                  label: "Кирс",
                },
                {
                  id: "Котельнич",
                  label: "Котельнич",
                },
                {
                  id: "Луза",
                  label: "Луза",
                },
                {
                  id: "Малмыж",
                  label: "Малмыж",
                },
                {
                  id: "Мураши",
                  label: "Мураши",
                },
                {
                  id: "Нолинск",
                  label: "Нолинск",
                },
                {
                  id: "Омутнинск",
                  label: "Омутнинск",
                },
                {
                  id: "Слободской",
                  label: "Слободской",
                },
                {
                  id: "Советск",
                  label: "Советск",
                },
                {
                  id: "Сосновка",
                  label: "Сосновка",
                },
                {
                  id: "Уржум",
                  label: "Уржум",
                },
                {
                  id: "Яранск",
                  label: "Яранск",
                },
              ],
            },
            {
              id: "Коми",
              label: "Коми",

              children: [
                {
                  id: "Воркута",
                  label: "Воркута",
                },
                {
                  id: "Вуктыл",
                  label: "Вуктыл",
                },
                {
                  id: "Емва",
                  label: "Емва",
                },
                {
                  id: "Инта",
                  label: "Инта",
                },
                {
                  id: "Микунь",
                  label: "Микунь",
                },
                {
                  id: "Печора",
                  label: "Печора",
                },
                {
                  id: "Сосногорск",
                  label: "Сосногорск",
                },
                {
                  id: "Сыктывкар",
                  label: "Сыктывкар",
                },
                {
                  id: "Усинск",
                  label: "Усинск",
                },
                {
                  id: "Ухта",
                  label: "Ухта",
                },
              ],
            },
            {
              id: "Костромская область",
              label: "Костромская область",

              children: [
                {
                  id: "Буй",
                  label: "Буй",
                },
                {
                  id: "Волгореченск",
                  label: "Волгореченск",
                },
                {
                  id: "Галич",
                  label: "Галич",
                },
                {
                  id: "Кологрив",
                  label: "Кологрив",
                },
                {
                  id: "Кострома",
                  label: "Кострома",
                },
                {
                  id: "Макарьев",
                  label: "Макарьев",
                },
                {
                  id: "Мантурово",
                  label: "Мантурово",
                },
                {
                  id: "Нерехта",
                  label: "Нерехта",
                },
                {
                  id: "Нея",
                  label: "Нея",
                },
                {
                  id: "Солигалич",
                  label: "Солигалич",
                },
                {
                  id: "Чухлома",
                  label: "Чухлома",
                },
                {
                  id: "Шарья",
                  label: "Шарья",
                },
              ],
            },
            {
              id: "Краснодарский край",
              label: "Краснодарский край",

              children: [
                {
                  id: "Абинск",
                  label: "Абинск",
                },
                {
                  id: "Анапа",
                  label: "Анапа",
                },
                {
                  id: "Апшеронск",
                  label: "Апшеронск",
                },
                {
                  id: "Армавир",
                  label: "Армавир",
                },
                {
                  id: "Белореченск",
                  label: "Белореченск",
                },
                {
                  id: "Геленджик",
                  label: "Геленджик",
                },
                {
                  id: "Горячий Ключ",
                  label: "Горячий Ключ",
                },
                {
                  id: "Гулькевичи",
                  label: "Гулькевичи",
                },
                {
                  id: "Ейск",
                  label: "Ейск",
                },
                {
                  id: "Кореновск",
                  label: "Кореновск",
                },
                {
                  id: "Краснодар",
                  label: "Краснодар",
                },
                {
                  id: "Кропоткин",
                  label: "Кропоткин",
                },
                {
                  id: "Крымск",
                  label: "Крымск",
                },
                {
                  id: "Курганинск",
                  label: "Курганинск",
                },
                {
                  id: "Лабинск",
                  label: "Лабинск",
                },
                {
                  id: "Новокубанск",
                  label: "Новокубанск",
                },
                {
                  id: "Новороссийск",
                  label: "Новороссийск",
                },
                {
                  id: "Приморско-Ахтарск",
                  label: "Приморско-Ахтарск",
                },
                {
                  id: "Славянск-на-Кубани",
                  label: "Славянск-на-Кубани",
                },
                {
                  id: "Сочи",
                  label: "Сочи",
                },
                {
                  id: "Темрюк",
                  label: "Темрюк",
                },
                {
                  id: "Тимашёвск",
                  label: "Тимашёвск",
                },
                {
                  id: "Тихорецк",
                  label: "Тихорецк",
                },
                {
                  id: "Туапсе",
                  label: "Туапсе",
                },
                {
                  id: "Усть-Лабинск",
                  label: "Усть-Лабинск",
                },
                {
                  id: "Хадыженск",
                  label: "Хадыженск",
                },
              ],
            },
            {
              id: "Красноярский край",
              label: "Красноярский край",

              children: [
                {
                  id: "Артёмовск",
                  label: "Артёмовск",
                },
                {
                  id: "Ачинск",
                  label: "Ачинск",
                },
                {
                  id: "Боготол",
                  label: "Боготол",
                },
                {
                  id: "Бородино",
                  label: "Бородино",
                },
                {
                  id: "Дивногорск",
                  label: "Дивногорск",
                },
                {
                  id: "Дудинка",
                  label: "Дудинка",
                },
                {
                  id: "Енисейск",
                  label: "Енисейск",
                },
                {
                  id: "Железногорск",
                  label: "Железногорск",
                },
                {
                  id: "Заозёрный",
                  label: "Заозёрный",
                },
                {
                  id: "Зеленогорск",
                  label: "Зеленогорск",
                },
                {
                  id: "Игарка",
                  label: "Игарка",
                },
                {
                  id: "Иланский",
                  label: "Иланский",
                },
                {
                  id: "Канск",
                  label: "Канск",
                },
                {
                  id: "Кодинск",
                  label: "Кодинск",
                },
                {
                  id: "Красноярск",
                  label: "Красноярск",
                },
                {
                  id: "Лесосибирск",
                  label: "Лесосибирск",
                },
                {
                  id: "Минусинск",
                  label: "Минусинск",
                },
                {
                  id: "Назарово",
                  label: "Назарово",
                },
                {
                  id: "Норильск",
                  label: "Норильск",
                },
                {
                  id: "Сосновоборск",
                  label: "Сосновоборск",
                },
                {
                  id: "Ужур",
                  label: "Ужур",
                },
                {
                  id: "Уяр",
                  label: "Уяр",
                },
                {
                  id: "Шарыпово",
                  label: "Шарыпово",
                },
              ],
            },
            {
              id: "Республика Крым",
              label: "Республика Крым",

              children: [
                {
                  id: "Ялта",
                  label: "Ялта",
                },
                {
                  id: "Алушта",
                  label: "Алушта",
                },
                {
                  id: "Армянск",
                  label: "Армянск",
                },
                {
                  id: "Бахчисарай",
                  label: "Бахчисарай",
                },
                {
                  id: "Джанкой",
                  label: "Джанкой",
                },
                {
                  id: "Евпатория",
                  label: "Евпатория",
                },
                {
                  id: "Красноперекопск",
                  label: "Красноперекопск",
                },
                {
                  id: "Керчь",
                  label: "Керчь",
                },
                {
                  id: "Саки",
                  label: "Саки",
                },
                {
                  id: "Симферополь",
                  label: "Симферополь",
                },
                {
                  id: "Судак",
                  label: "Судак",
                },
                {
                  id: "Феодосия",
                  label: "Феодосия",
                },
                {
                  id: "Ялта",
                  label: "Ялта",
                },
              ],
            },
            {
              id: "Курганская область",
              label: "Курганская область",

              children: [
                {
                  id: "Далматово",
                  label: "Далматово",
                },
                {
                  id: "Катайск",
                  label: "Катайск",
                },
                {
                  id: "Курган",
                  label: "Курган",
                },
                {
                  id: "Куртамыш",
                  label: "Куртамыш",
                },
                {
                  id: "Макушино",
                  label: "Макушино",
                },
                {
                  id: "Петухово",
                  label: "Петухово",
                },
                {
                  id: "Шадринск",
                  label: "Шадринск",
                },
                {
                  id: "Шумиха",
                  label: "Шумиха",
                },
                {
                  id: "Щучье",
                  label: "Щучье",
                },
              ],
            },
            {
              id: "Курская область",
              label: "Курская область",

              children: [
                {
                  id: "Дмитриев",
                  label: "Дмитриев",
                },
                {
                  id: "Железногорск",
                  label: "Железногорск",
                },
                {
                  id: "Курск",
                  label: "Курск",
                },
                {
                  id: "Курчатов",
                  label: "Курчатов",
                },
                {
                  id: "Льгов",
                  label: "Льгов",
                },
                {
                  id: "Обоянь",
                  label: "Обоянь",
                },
                {
                  id: "Рыльск",
                  label: "Рыльск",
                },
                {
                  id: "Суджа",
                  label: "Суджа",
                },
                {
                  id: "Фатеж",
                  label: "Фатеж",
                },
                {
                  id: "Щигры",
                  label: "Щигры",
                },
              ],
            },
            {
              id: "Ленинградская область",
              label: "Ленинградская область",

              children: [
                {
                  id: "Санкт-Петербург",
                  label: "Санкт-Петербург",
                },
                {
                  id: "Бокситогорск",
                  label: "Бокситогорск",
                },
                {
                  id: "Волосово",
                  label: "Волосово",
                },
                {
                  id: "Волхов",
                  label: "Волхов",
                },
                {
                  id: "Всеволожск",
                  label: "Всеволожск",
                },
                {
                  id: "Выборг",
                  label: "Выборг",
                },
                {
                  id: "Высоцк",
                  label: "Высоцк",
                },
                {
                  id: "Гатчина",
                  label: "Гатчина",
                },
                {
                  id: "Ивангород",
                  label: "Ивангород",
                },
                {
                  id: "Каменногорск",
                  label: "Каменногорск",
                },
                {
                  id: "Кингисепп",
                  label: "Кингисепп",
                },
                {
                  id: "Кириши",
                  label: "Кириши",
                },
                {
                  id: "Кировск",
                  label: "Кировск",
                },
                {
                  id: "Коммунар",
                  label: "Коммунар",
                },
                {
                  id: "Кудрово",
                  label: "Кудрово",
                },
                {
                  id: "Лодейное Поле",
                  label: "Лодейное Поле",
                },
                {
                  id: "Луга",
                  label: "Луга",
                },
                {
                  id: "Любань",
                  label: "Любань",
                },
                {
                  id: "Никольское",
                  label: "Никольское",
                },
                {
                  id: "Новая Ладога",
                  label: "Новая Ладога",
                },
                {
                  id: "Отрадное",
                  label: "Отрадное",
                },
                {
                  id: "Пикалёво",
                  label: "Пикалёво",
                },
                {
                  id: "Подпорожье",
                  label: "Подпорожье",
                },
                {
                  id: "Приморск1",
                  label: "Приморск",
                },
                {
                  id: "Приозерск",
                  label: "Приозерск",
                },
                {
                  id: "Светогорск",
                  label: "Светогорск",
                },
                {
                  id: "Сертолово",
                  label: "Сертолово",
                },
                {
                  id: "Сланцы",
                  label: "Сланцы",
                },
                {
                  id: "Сосновый Бор",
                  label: "Сосновый Бор",
                },
                {
                  id: "Сясьстрой",
                  label: "Сясьстрой",
                },
                {
                  id: "Тихвин",
                  label: "Тихвин",
                },
                {
                  id: "Тосно",
                  label: "Тосно",
                },
                {
                  id: "Шлиссельбург",
                  label: "Шлиссельбург",
                },
              ],
            },
            {
              id: "Липецкая область",
              label: "Липецкая область",

              children: [
                {
                  id: "Грязи",
                  label: "Грязи",
                },
                {
                  id: "Данков",
                  label: "Данков",
                },
                {
                  id: "Елец",
                  label: "Елец",
                },
                {
                  id: "Задонск",
                  label: "Задонск",
                },
                {
                  id: "Лебедянь",
                  label: "Лебедянь",
                },
                {
                  id: "Липецк",
                  label: "Липецк",
                },
                {
                  id: "Усмань",
                  label: "Усмань",
                },
                {
                  id: "Чаплыгин",
                  label: "Чаплыгин",
                },
              ],
            },
            {
              id: "Магаданская область",
              label: "Магаданская область",

              children: [
                {
                  id: "Магадан",
                  label: "Магадан",
                },
                {
                  id: "Сусуман",
                  label: "Сусуман",
                },
              ],
            },
            {
              id: "Марий Эл",
              label: "Марий Эл",

              children: [
                {
                  id: "Волжск",
                  label: "Волжск",
                },
                {
                  id: "Звенигово",
                  label: "Звенигово",
                },
                {
                  id: "Йошкар-Ола",
                  label: "Йошкар-Ола",
                },
                {
                  id: "Козьмодемьянск",
                  label: "Козьмодемьянск",
                },
              ],
            },
            {
              id: "Мордовия",
              label: "Мордовия",

              children: [
                {
                  id: "Ардатов",
                  label: "Ардатов",
                },
                {
                  id: "Инсар",
                  label: "Инсар",
                },
                {
                  id: "Ковылкино",
                  label: "Ковылкино",
                },
                {
                  id: "Краснослободск",
                  label: "Краснослободск",
                },
                {
                  id: "Рузаевка",
                  label: "Рузаевка",
                },
                {
                  id: "Саранск",
                  label: "Саранск",
                },
                {
                  id: "Темников",
                  label: "Темников",
                },
              ],
            },
            {
              id: "Московская область",
              label: "Московская область",

              children: [
                {
                  id: "Москва",
                  label: "Москва",
                },
                {
                  id: "Апрелевка",
                  label: "Апрелевка",
                },
                {
                  id: "Балашиха",
                  label: "Балашиха",
                },
                {
                  id: "Бронницы",
                  label: "Бронницы",
                },
                {
                  id: "Верея",
                  label: "Верея",
                },
                {
                  id: "Видное",
                  label: "Видное",
                },
                {
                  id: "Волоколамск",
                  label: "Волоколамск",
                },
                {
                  id: "Воскресенск",
                  label: "Воскресенск",
                },
                {
                  id: "Высоковск",
                  label: "Высоковск",
                },
                {
                  id: "Голицыно",
                  label: "Голицыно",
                },
                {
                  id: "Дедовск",
                  label: "Дедовск",
                },
                {
                  id: "Дзержинский",
                  label: "Дзержинский",
                },
                {
                  id: "Дмитров",
                  label: "Дмитров",
                },
                {
                  id: "Долгопрудный",
                  label: "Долгопрудный",
                },
                {
                  id: "Дрезна",
                  label: "Дрезна",
                },
                {
                  id: "Дубна",
                  label: "Дубна",
                },
                {
                  id: "Егорьевск",
                  label: "Егорьевск",
                },
                {
                  id: "Жуковский",
                  label: "Жуковский",
                },
                {
                  id: "Зарайск",
                  label: "Зарайск",
                },
                {
                  id: "Звенигород",
                  label: "Звенигород",
                },
                {
                  id: "Ивантеевка",
                  label: "Ивантеевка",
                },
                {
                  id: "Истра",
                  label: "Истра",
                },
                {
                  id: "Кашира",
                  label: "Кашира",
                },
                {
                  id: "Клин",
                  label: "Клин",
                },
                {
                  id: "Коломна",
                  label: "Коломна",
                },
                {
                  id: "Королёв",
                  label: "Королёв",
                },
                {
                  id: "Котельники",
                  label: "Котельники",
                },
                {
                  id: "Красноармейск",
                  label: "Красноармейск",
                },
                {
                  id: "Красногорск",
                  label: "Красногорск",
                },
                {
                  id: "Краснозаводск",
                  label: "Краснозаводск",
                },
                {
                  id: "Краснознаменск",
                  label: "Краснознаменск",
                },
                {
                  id: "Кубинка",
                  label: "Кубинка",
                },
                {
                  id: "Куровское",
                  label: "Куровское",
                },
                {
                  id: "Ликино-Дулёво",
                  label: "Ликино-Дулёво",
                },
                {
                  id: "Лобня",
                  label: "Лобня",
                },
                {
                  id: "Лосино-Петровский",
                  label: "Лосино-Петровский",
                },
                {
                  id: "Луховицы",
                  label: "Луховицы",
                },
                {
                  id: "Лыткарино",
                  label: "Лыткарино",
                },
                {
                  id: "Люберцы",
                  label: "Люберцы",
                },
                {
                  id: "Можайск",
                  label: "Можайск",
                },
                {
                  id: "Мытищи",
                  label: "Мытищи",
                },
                {
                  id: "Наро-Фоминск",
                  label: "Наро-Фоминск",
                },
                {
                  id: "Ногинск",
                  label: "Ногинск",
                },
                {
                  id: "Одинцово",
                  label: "Одинцово",
                },
                {
                  id: "Озёры",
                  label: "Озёры",
                },
                {
                  id: "Орехово-Зуево",
                  label: "Орехово-Зуево",
                },
                {
                  id: "Павловский Посад",
                  label: "Павловский Посад",
                },
                {
                  id: "Подольск",
                  label: "Подольск",
                },
                {
                  id: "Протвино",
                  label: "Протвино",
                },
                {
                  id: "Пушкино",
                  label: "Пушкино",
                },
                {
                  id: "Пущино",
                  label: "Пущино",
                },
                {
                  id: "Раменское",
                  label: "Раменское",
                },
                {
                  id: "Реутов",
                  label: "Реутов",
                },
                {
                  id: "Рошаль",
                  label: "Рошаль",
                },
                {
                  id: "Руза",
                  label: "Руза",
                },
                {
                  id: "Сергиев Посад",
                  label: "Сергиев Посад",
                },
                {
                  id: "Серпухов",
                  label: "Серпухов",
                },
                {
                  id: "Солнечногорск",
                  label: "Солнечногорск",
                },
                {
                  id: "Старая Купавна",
                  label: "Старая Купавна",
                },
                {
                  id: "Ступино",
                  label: "Ступино",
                },
                {
                  id: "Талдом",
                  label: "Талдом",
                },
                {
                  id: "Фрязино",
                  label: "Фрязино",
                },
                {
                  id: "Химки",
                  label: "Химки",
                },
                {
                  id: "Хотьково",
                  label: "Хотьково",
                },
                {
                  id: "Черноголовка",
                  label: "Черноголовка",
                },
                {
                  id: "Чехов",
                  label: "Чехов",
                },
                {
                  id: "Щёлково",
                  label: "Щёлково",
                },
                {
                  id: "Электрогорск",
                  label: "Электрогорск",
                },
                {
                  id: "Электросталь",
                  label: "Электросталь",
                },
                {
                  id: "Электроугли",
                  label: "Электроугли",
                },
                {
                  id: "Яхрома",
                  label: "Яхрома",
                },
              ],
            },
            {
              id: "Мурманская область",
              label: "Мурманская область",

              children: [
                {
                  id: "Апатиты",
                  label: "Апатиты",
                },
                {
                  id: "Гаджиево",
                  label: "Гаджиево",
                },
                {
                  id: "Заозёрск",
                  label: "Заозёрск",
                },
                {
                  id: "Заполярный",
                  label: "Заполярный",
                },
                {
                  id: "Кандалакша",
                  label: "Кандалакша",
                },
                {
                  id: "Кировск",
                  label: "Кировск",
                },
                {
                  id: "Ковдор",
                  label: "Ковдор",
                },
                {
                  id: "Кола",
                  label: "Кола",
                },
                {
                  id: "Мончегорск",
                  label: "Мончегорск",
                },
                {
                  id: "Мурманск",
                  label: "Мурманск",
                },
                {
                  id: "Оленегорск",
                  label: "Оленегорск",
                },
                {
                  id: "Островной",
                  label: "Островной",
                },
                {
                  id: "Полярные Зори",
                  label: "Полярные Зори",
                },
                {
                  id: "Полярный",
                  label: "Полярный",
                },
                {
                  id: "Североморск",
                  label: "Североморск",
                },
                {
                  id: "Снежногорск",
                  label: "Снежногорск",
                },
              ],
            },
            {
              id: "Ненецкий АО",
              label: "Ненецкий АО",

              children: [
                {
                  id: "Нарьян-Мар",
                  label: "Нарьян-Мар",
                },
              ],
            },
            {
              id: "Нижегородская область",
              label: "Нижегородская область",

              children: [
                {
                  id: "Арзамас",
                  label: "Арзамас",
                },
                {
                  id: "Балахна",
                  label: "Балахна",
                },
                {
                  id: "Богородск",
                  label: "Богородск",
                },
                {
                  id: "Бор",
                  label: "Бор",
                },
                {
                  id: "Ветлуга",
                  label: "Ветлуга",
                },
                {
                  id: "Володарск",
                  label: "Володарск",
                },
                {
                  id: "Ворсма",
                  label: "Ворсма",
                },
                {
                  id: "Выкса",
                  label: "Выкса",
                },
                {
                  id: "Горбатов",
                  label: "Горбатов",
                },
                {
                  id: "Городец",
                  label: "Городец",
                },
                {
                  id: "Дзержинск1",
                  label: "Дзержинск",
                },
                {
                  id: "Заволжье",
                  label: "Заволжье",
                },
                {
                  id: "Княгинино",
                  label: "Княгинино",
                },
                {
                  id: "Кстово",
                  label: "Кстово",
                },
                {
                  id: "Кулебаки",
                  label: "Кулебаки",
                },
                {
                  id: "Лукоянов",
                  label: "Лукоянов",
                },
                {
                  id: "Лысково",
                  label: "Лысково",
                },
                {
                  id: "Навашино",
                  label: "Навашино",
                },
                {
                  id: "Нижний Новгород",
                  label: "Нижний Новгород",
                },
                {
                  id: "Павлово",
                  label: "Павлово",
                },
                {
                  id: "Первомайск",
                  label: "Первомайск",
                },
                {
                  id: "Перевоз",
                  label: "Перевоз",
                },
                {
                  id: "Саров",
                  label: "Саров",
                },
                {
                  id: "Семёнов",
                  label: "Семёнов",
                },
                {
                  id: "Сергач",
                  label: "Сергач",
                },
                {
                  id: "Урень",
                  label: "Урень",
                },
                {
                  id: "Чкаловск",
                  label: "Чкаловск",
                },
                {
                  id: "Шахунья",
                  label: "Шахунья",
                },
              ],
            },
            {
              id: "Новгородская область",
              label: "Новгородская область",

              children: [
                {
                  id: "Боровичи",
                  label: "Боровичи",
                },
                {
                  id: "Валдай",
                  label: "Валдай",
                },
                {
                  id: "Великий Новгород",
                  label: "Великий Новгород",
                },
                {
                  id: "Малая Вишера",
                  label: "Малая Вишера",
                },
                {
                  id: "Окуловка",
                  label: "Окуловка",
                },
                {
                  id: "Пестово",
                  label: "Пестово",
                },
                {
                  id: "Сольцы",
                  label: "Сольцы",
                },
                {
                  id: "Старая Русса",
                  label: "Старая Русса",
                },
                {
                  id: "Холм",
                  label: "Холм",
                },
                {
                  id: "Чудово",
                  label: "Чудово",
                },
              ],
            },
            {
              id: "Новосибирская область",
              label: "Новосибирская область",

              children: [
                {
                  id: "Барабинск",
                  label: "Барабинск",
                },
                {
                  id: "Бердск",
                  label: "Бердск",
                },
                {
                  id: "Болотное",
                  label: "Болотное",
                },
                {
                  id: "Искитим",
                  label: "Искитим",
                },
                {
                  id: "Карасук",
                  label: "Карасук",
                },
                {
                  id: "Каргат",
                  label: "Каргат",
                },
                {
                  id: "Куйбышев",
                  label: "Куйбышев",
                },
                {
                  id: "Купино",
                  label: "Купино",
                },
                {
                  id: "Новосибирск",
                  label: "Новосибирск",
                },
                {
                  id: "Обь",
                  label: "Обь",
                },
                {
                  id: "Татарск",
                  label: "Татарск",
                },
                {
                  id: "Тогучин",
                  label: "Тогучин",
                },
                {
                  id: "Черепаново",
                  label: "Черепаново",
                },
                {
                  id: "Чулым",
                  label: "Чулым",
                },
              ],
            },
            {
              id: "Омская область",
              label: "Омская область",

              children: [
                {
                  id: "Исилькуль",
                  label: "Исилькуль",
                },
                {
                  id: "Калачинск",
                  label: "Калачинск",
                },
                {
                  id: "Называевск",
                  label: "Называевск",
                },
                {
                  id: "Омск",
                  label: "Омск",
                },
                {
                  id: "Тюкалинск",
                  label: "Тюкалинск",
                },
              ],
            },
            {
              id: "Оренбургская область",
              label: "Оренбургская область",

              children: [
                {
                  id: "Абдулино",
                  label: "Абдулино",
                },
                {
                  id: "Бугуруслан",
                  label: "Бугуруслан",
                },
                {
                  id: "Бузулук",
                  label: "Бузулук",
                },
                {
                  id: "Кувандык",
                  label: "Кувандык",
                },
                {
                  id: "Медногорск",
                  label: "Медногорск",
                },
                {
                  id: "Новотроицк",
                  label: "Новотроицк",
                },
                {
                  id: "Оренбург",
                  label: "Оренбург",
                },
                {
                  id: "Орск",
                  label: "Орск",
                },
                {
                  id: "Соль-Илецк",
                  label: "Соль-Илецк",
                },
                {
                  id: "Сорочинск",
                  label: "Сорочинск",
                },
                {
                  id: "Ясный",
                  label: "Ясный",
                },
              ],
            },
            {
              id: "Орловская область",
              label: "Орловская область",

              children: [
                {
                  id: "Болхов",
                  label: "Болхов",
                },
                {
                  id: "Дмитровск",
                  label: "Дмитровск",
                },
                {
                  id: "Ливны",
                  label: "Ливны",
                },
                {
                  id: "Малоархангельск",
                  label: "Малоархангельск",
                },
                {
                  id: "Мценск",
                  label: "Мценск",
                },
                {
                  id: "Новосиль",
                  label: "Новосиль",
                },
                {
                  id: "Орёл",
                  label: "Орёл",
                },
              ],
            },
            {
              id: "Пензенская область",
              label: "Пензенская область",

              children: [
                {
                  id: "Белинский",
                  label: "Белинский",
                },
                {
                  id: "Городище",
                  label: "Городище",
                },
                {
                  id: "Заречный",
                  label: "Заречный",
                },
                {
                  id: "Каменка",
                  label: "Каменка",
                },
                {
                  id: "Кузнецк",
                  label: "Кузнецк",
                },
                {
                  id: "Нижний Ломов",
                  label: "Нижний Ломов",
                },
                {
                  id: "Никольск",
                  label: "Никольск",
                },
                {
                  id: "Пенза",
                  label: "Пенза",
                },
                {
                  id: "Сердобск",
                  label: "Сердобск",
                },
                {
                  id: "Спасск",
                  label: "Спасск",
                },
                {
                  id: "Сурск",
                  label: "Сурск",
                },
              ],
            },
            {
              id: "Пермский край",
              label: "Пермский край",

              children: [
                {
                  id: "Александровск",
                  label: "Александровск",
                },
                {
                  id: "Березники",
                  label: "Березники",
                },
                {
                  id: "Верещагино",
                  label: "Верещагино",
                },
                {
                  id: "Горнозаводск",
                  label: "Горнозаводск",
                },
                {
                  id: "Гремячинск",
                  label: "Гремячинск",
                },
                {
                  id: "Губаха",
                  label: "Губаха",
                },
                {
                  id: "Добрянка",
                  label: "Добрянка",
                },
                {
                  id: "Кизел",
                  label: "Кизел",
                },
                {
                  id: "Красновишерск",
                  label: "Красновишерск",
                },
                {
                  id: "Краснокамск",
                  label: "Краснокамск",
                },
                {
                  id: "Кудымкар",
                  label: "Кудымкар",
                },
                {
                  id: "Кунгур",
                  label: "Кунгур",
                },
                {
                  id: "Лысьва",
                  label: "Лысьва",
                },
                {
                  id: "Нытва",
                  label: "Нытва",
                },
                {
                  id: "Оса",
                  label: "Оса",
                },
                {
                  id: "Оханск",
                  label: "Оханск",
                },
                {
                  id: "Очёр",
                  label: "Очёр",
                },
                {
                  id: "Пермь",
                  label: "Пермь",
                },
                {
                  id: "Соликамск",
                  label: "Соликамск",
                },
                {
                  id: "Усолье",
                  label: "Усолье",
                },
                {
                  id: "Чайковский",
                  label: "Чайковский",
                },
                {
                  id: "Чердынь",
                  label: "Чердынь",
                },
                {
                  id: "Чёрмоз",
                  label: "Чёрмоз",
                },
                {
                  id: "Чернушка",
                  label: "Чернушка",
                },
                {
                  id: "Чусовой",
                  label: "Чусовой",
                },
              ],
            },
            {
              id: "Приморский край",
              label: "Приморский край",

              children: [
                {
                  id: "Арсеньев",
                  label: "Арсеньев",
                },
                {
                  id: "Артём",
                  label: "Артём",
                },
                {
                  id: "Большой Камень",
                  label: "Большой Камень",
                },
                {
                  id: "Владивосток",
                  label: "Владивосток",
                },
                {
                  id: "Дальнегорск",
                  label: "Дальнегорск",
                },
                {
                  id: "Дальнереченск",
                  label: "Дальнереченск",
                },
                {
                  id: "Лесозаводск",
                  label: "Лесозаводск",
                },
                {
                  id: "Находка",
                  label: "Находка",
                },
                {
                  id: "Партизанск",
                  label: "Партизанск",
                },
                {
                  id: "Спасск-Дальний",
                  label: "Спасск-Дальний",
                },
                {
                  id: "Уссурийск",
                  label: "Уссурийск",
                },
                {
                  id: "Фокино",
                  label: "Фокино",
                },
              ],
            },
            {
              id: "Псковская область",
              label: "Псковская область",

              children: [
                {
                  id: "Великие Луки",
                  label: "Великие Луки",
                },
                {
                  id: "Гдов",
                  label: "Гдов",
                },
                {
                  id: "Дно",
                  label: "Дно",
                },
                {
                  id: "Невель",
                  label: "Невель",
                },
                {
                  id: "Новоржев",
                  label: "Новоржев",
                },
                {
                  id: "Новосокольники",
                  label: "Новосокольники",
                },
                {
                  id: "Опочка",
                  label: "Опочка",
                },
                {
                  id: "Остров",
                  label: "Остров",
                },
                {
                  id: "Печоры",
                  label: "Печоры",
                },
                {
                  id: "Порхов",
                  label: "Порхов",
                },
                {
                  id: "Псков",
                  label: "Псков",
                },
                {
                  id: "Пустошка",
                  label: "Пустошка",
                },
                {
                  id: "Пыталово",
                  label: "Пыталово",
                },
                {
                  id: "Себеж",
                  label: "Себеж",
                },
              ],
            },
            {
              id: "Ростовская область",
              label: "Ростовская область",

              children: [
                {
                  id: "Азов",
                  label: "Азов",
                },
                {
                  id: "Аксай",
                  label: "Аксай",
                },
                {
                  id: "Батайск",
                  label: "Батайск",
                },
                {
                  id: "Белая Калитва",
                  label: "Белая Калитва",
                },
                {
                  id: "Волгодонск",
                  label: "Волгодонск",
                },
                {
                  id: "Гуково",
                  label: "Гуково",
                },
                {
                  id: "Донецк",
                  label: "Донецк",
                },
                {
                  id: "Зверево",
                  label: "Зверево",
                },
                {
                  id: "Зерноград",
                  label: "Зерноград",
                },
                {
                  id: "Каменск-Шахтинский",
                  label: "Каменск-Шахтинский",
                },
                {
                  id: "Константиновск",
                  label: "Константиновск",
                },
                {
                  id: "Красный Сулин",
                  label: "Красный Сулин",
                },
                {
                  id: "Миллерово",
                  label: "Миллерово",
                },
                {
                  id: "Морозовск",
                  label: "Морозовск",
                },
                {
                  id: "Новочеркасск",
                  label: "Новочеркасск",
                },
                {
                  id: "Новошахтинск",
                  label: "Новошахтинск",
                },
                {
                  id: "Пролетарск",
                  label: "Пролетарск",
                },
                {
                  id: "Ростов-на-Дону",
                  label: "Ростов-на-Дону",
                },
                {
                  id: "Сальск",
                  label: "Сальск",
                },
                {
                  id: "Семикаракорск",
                  label: "Семикаракорск",
                },
                {
                  id: "Таганрог",
                  label: "Таганрог",
                },
                {
                  id: "Цимлянск",
                  label: "Цимлянск",
                },
                {
                  id: "Шахты",
                  label: "Шахты",
                },
              ],
            },
            {
              id: "Рязанская область",
              label: "Рязанская область",

              children: [
                {
                  id: "Касимов",
                  label: "Касимов",
                },
                {
                  id: "Кораблино",
                  label: "Кораблино",
                },
                {
                  id: "Михайлов",
                  label: "Михайлов",
                },
                {
                  id: "Новомичуринск",
                  label: "Новомичуринск",
                },
                {
                  id: "Рыбное",
                  label: "Рыбное",
                },
                {
                  id: "Ряжск",
                  label: "Ряжск",
                },
                {
                  id: "Рязань",
                  label: "Рязань",
                },
                {
                  id: "Сасово",
                  label: "Сасово",
                },
                {
                  id: "Скопин",
                  label: "Скопин",
                },
                {
                  id: "Спас-Клепики",
                  label: "Спас-Клепики",
                },
                {
                  id: "Спасск-Рязанский",
                  label: "Спасск-Рязанский",
                },
                {
                  id: "Шацк",
                  label: "Шацк",
                },
              ],
            },
            {
              id: "Самарская область",
              label: "Самарская область",

              children: [
                {
                  id: "Жигулёвск",
                  label: "Жигулёвск",
                },
                {
                  id: "Кинель",
                  label: "Кинель",
                },
                {
                  id: "Нефтегорск",
                  label: "Нефтегорск",
                },
                {
                  id: "Новокуйбышевск",
                  label: "Новокуйбышевск",
                },
                {
                  id: "Октябрьск",
                  label: "Октябрьск",
                },
                {
                  id: "Отрадный",
                  label: "Отрадный",
                },
                {
                  id: "Похвистнево",
                  label: "Похвистнево",
                },
                {
                  id: "Самара",
                  label: "Самара",
                },
                {
                  id: "Сызрань",
                  label: "Сызрань",
                },
                {
                  id: "Тольятти",
                  label: "Тольятти",
                },
                {
                  id: "Чапаевск",
                  label: "Чапаевск",
                },
              ],
            },
            {
              id: "Саратовская область",
              label: "Саратовская область",

              children: [
                {
                  id: "Аркадак",
                  label: "Аркадак",
                },
                {
                  id: "Аткарск",
                  label: "Аткарск",
                },
                {
                  id: "Балаково",
                  label: "Балаково",
                },
                {
                  id: "Балашов",
                  label: "Балашов",
                },
                {
                  id: "Вольск",
                  label: "Вольск",
                },
                {
                  id: "Ершов",
                  label: "Ершов",
                },
                {
                  id: "Калининск",
                  label: "Калининск",
                },
                {
                  id: "Красноармейск",
                  label: "Красноармейск",
                },
                {
                  id: "Красный Кут",
                  label: "Красный Кут",
                },
                {
                  id: "Маркс",
                  label: "Маркс",
                },
                {
                  id: "Новоузенск",
                  label: "Новоузенск",
                },
                {
                  id: "Петровск",
                  label: "Петровск",
                },
                {
                  id: "Пугачёв",
                  label: "Пугачёв",
                },
                {
                  id: "Ртищево",
                  label: "Ртищево",
                },
                {
                  id: "Саратов",
                  label: "Саратов",
                },
                {
                  id: "Хвалынск",
                  label: "Хвалынск",
                },
                {
                  id: "Шиханы",
                  label: "Шиханы",
                },
                {
                  id: "Энгельс",
                  label: "Энгельс",
                },
              ],
            },
            {
              id: "Сахалинская область",
              label: "Сахалинская область",

              children: [
                {
                  id: "Александровск-Сахалинский",
                  label: "Александровск-Сахалинский",
                },
                {
                  id: "Анива",
                  label: "Анива",
                },
                {
                  id: "Долинск",
                  label: "Долинск",
                },
                {
                  id: "Корсаков",
                  label: "Корсаков",
                },
                {
                  id: "Курильск",
                  label: "Курильск",
                },
                {
                  id: "Макаров",
                  label: "Макаров",
                },
                {
                  id: "Невельск",
                  label: "Невельск",
                },
                {
                  id: "Оха",
                  label: "Оха",
                },
                {
                  id: "Поронайск",
                  label: "Поронайск",
                },
                {
                  id: "Северо-Курильск",
                  label: "Северо-Курильск",
                },
                {
                  id: "Томари",
                  label: "Томари",
                },
                {
                  id: "Углегорск",
                  label: "Углегорск",
                },
                {
                  id: "Холмск",
                  label: "Холмск",
                },
                {
                  id: "Южно-Сахалинск",
                  label: "Южно-Сахалинск",
                },
              ],
            },
            {
              id: "Свердловская область",
              label: "Свердловская область",

              children: [
                {
                  id: "Алапаевск",
                  label: "Алапаевск",
                },
                {
                  id: "Артёмовский",
                  label: "Артёмовский",
                },
                {
                  id: "Асбест",
                  label: "Асбест",
                },
                {
                  id: "Берёзовский",
                  label: "Берёзовский",
                },
                {
                  id: "Богданович",
                  label: "Богданович",
                },
                {
                  id: "ВерхнийТагил",
                  label: "ВерхнийТагил",
                },
                {
                  id: "Верхняя Пышма",
                  label: "Верхняя Пышма",
                },
                {
                  id: "Верхняя Салда",
                  label: "Верхняя Салда",
                },
                {
                  id: "Верхняя Тура",
                  label: "Верхняя Тура",
                },
                {
                  id: "Верхотурье",
                  label: "Верхотурье",
                },
                {
                  id: "Волчанск",
                  label: "Волчанск",
                },
                {
                  id: "Дегтярск",
                  label: "Дегтярск",
                },
                {
                  id: "Екатеринбург",
                  label: "Екатеринбург",
                },
                {
                  id: "Заречный",
                  label: "Заречный",
                },
                {
                  id: "Ивдель",
                  label: "Ивдель",
                },
                {
                  id: "Ирбит",
                  label: "Ирбит",
                },
                {
                  id: "Каменск-Уральский",
                  label: "Каменск-Уральский",
                },
                {
                  id: "Камышлов",
                  label: "Камышлов",
                },
                {
                  id: "Карпинск",
                  label: "Карпинск",
                },
                {
                  id: "Качканар",
                  label: "Качканар",
                },
                {
                  id: "Кировград",
                  label: "Кировград",
                },
                {
                  id: "Краснотурьинск",
                  label: "Краснотурьинск",
                },
                {
                  id: "Красноуральск",
                  label: "Красноуральск",
                },
                {
                  id: "Красноуфимск",
                  label: "Красноуфимск",
                },
                {
                  id: "Кушва",
                  label: "Кушва",
                },
                {
                  id: "Михайловск",
                  label: "Михайловск",
                },
                {
                  id: "Невьянск",
                  label: "Невьянск",
                },
                {
                  id: "Нижние Серги",
                  label: "Нижние Серги",
                },
                {
                  id: "Нижний Тагил",
                  label: "Нижний Тагил",
                },
                {
                  id: "Нижняя Салда",
                  label: "Нижняя Салда",
                },
                {
                  id: "Нижняя Тура",
                  label: "Нижняя Тура",
                },
                {
                  id: "Новая Ляля",
                  label: "Новая Ляля",
                },
                {
                  id: "Новоуральск",
                  label: "Новоуральск",
                },
                {
                  id: "Первоуральск",
                  label: "Первоуральск",
                },
                {
                  id: "Полевской",
                  label: "Полевской",
                },
                {
                  id: "Ревда",
                  label: "Ревда",
                },
                {
                  id: "Реж",
                  label: "Реж",
                },
                {
                  id: "Североуральск",
                  label: "Североуральск",
                },
                {
                  id: "Среднеуральск",
                  label: "Среднеуральск",
                },
                {
                  id: "Сухой Лог",
                  label: "Сухой Лог",
                },
                {
                  id: "Сысерть",
                  label: "Сысерть",
                },
                {
                  id: "Тавда",
                  label: "Тавда",
                },
                {
                  id: "Талица",
                  label: "Талица",
                },
                {
                  id: "Туринск",
                  label: "Туринск",
                },
              ],
            },
            {
              id: "Северная Осетия — Алания",
              label: "Северная Осетия — Алания",

              children: [
                {
                  id: "Алагир",
                  label: "Алагир",
                },
                {
                  id: "Ардон",
                  label: "Ардон",
                },
                {
                  id: "Беслан",
                  label: "Беслан",
                },
                {
                  id: "Владикавказ",
                  label: "Владикавказ",
                },
                {
                  id: "Дигора",
                  label: "Дигора",
                },
                {
                  id: "Моздок",
                  label: "Моздок",
                },
              ],
            },
            {
              id: "Смоленская область",
              label: "Смоленская область",

              children: [
                {
                  id: "Велиж",
                  label: "Велиж",
                },
                {
                  id: "Вязьма",
                  label: "Вязьма",
                },
                {
                  id: "Демидов",
                  label: "Демидов",
                },
                {
                  id: "Десногорск",
                  label: "Десногорск",
                },
                {
                  id: "Дорогобуж",
                  label: "Дорогобуж",
                },
                {
                  id: "Духовщина",
                  label: "Духовщина",
                },
                {
                  id: "Ельня",
                  label: "Ельня",
                },
                {
                  id: "Починок",
                  label: "Починок",
                },
                {
                  id: "Рославль",
                  label: "Рославль",
                },
                {
                  id: "Рудня",
                  label: "Рудня",
                },
                {
                  id: "Сафоново",
                  label: "Сафоново",
                },
                {
                  id: "Смоленск",
                  label: "Смоленск",
                },
                {
                  id: "Сычёвка",
                  label: "Сычёвка",
                },
                {
                  id: "Ярцево",
                  label: "Ярцево",
                },
              ],
            },
            {
              id: "Ставропольский край",
              label: "Ставропольский край",

              children: [
                {
                  id: "Благодарный",
                  label: "Благодарный",
                },
                {
                  id: "Будённовск",
                  label: "Будённовск",
                },
                {
                  id: "Георгиевск",
                  label: "Георгиевск",
                },
                {
                  id: "Ессентуки",
                  label: "Ессентуки",
                },
                {
                  id: "Железноводск",
                  label: "Железноводск",
                },
                {
                  id: "Зеленокумск",
                  label: "Зеленокумск",
                },
                {
                  id: "Изобильный",
                  label: "Изобильный",
                },
                {
                  id: "Ипатово",
                  label: "Ипатово",
                },
                {
                  id: "Кисловодск",
                  label: "Кисловодск",
                },
                {
                  id: "Лермонтов",
                  label: "Лермонтов",
                },
                {
                  id: "Минеральные Воды",
                  label: "Минеральные Воды",
                },
                {
                  id: "Михайловск",
                  label: "Михайловск",
                },
                {
                  id: "Невинномысск",
                  label: "Невинномысск",
                },
                {
                  id: "Нефтекумск",
                  label: "Нефтекумск",
                },
                {
                  id: "Новоалександровск",
                  label: "Новоалександровск",
                },
                {
                  id: "Новопавловск",
                  label: "Новопавловск",
                },
                {
                  id: "Пятигорск",
                  label: "Пятигорск",
                },
                {
                  id: "Светлоград",
                  label: "Светлоград",
                },
                {
                  id: "Ставрополь",
                  label: "Ставрополь",
                },
              ],
            },
            {
              id: "Тамбовская область",
              label: "Тамбовская область",

              children: [
                {
                  id: "Жердевка",
                  label: "Жердевка",
                },
                {
                  id: "Кирсанов",
                  label: "Кирсанов",
                },
                {
                  id: "Котовск",
                  label: "Котовск",
                },
                {
                  id: "Мичуринск",
                  label: "Мичуринск",
                },
                {
                  id: "Моршанск",
                  label: "Моршанск",
                },
                {
                  id: "Рассказово",
                  label: "Рассказово",
                },
                {
                  id: "Тамбов",
                  label: "Тамбов",
                },
                {
                  id: "Уварово",
                  label: "Уварово",
                },
              ],
            },
            {
              id: "Татарстан",
              label: "Татарстан",

              children: [
                {
                  id: "Агрыз",
                  label: "Агрыз",
                },
                {
                  id: "Азнакаево",
                  label: "Азнакаево",
                },
                {
                  id: "Альметьевск",
                  label: "Альметьевск",
                },
                {
                  id: "Арск",
                  label: "Арск",
                },
                {
                  id: "Бавлы",
                  label: "Бавлы",
                },
                {
                  id: "Болгар",
                  label: "Болгар",
                },
                {
                  id: "Бугульма",
                  label: "Бугульма",
                },
                {
                  id: "Буинск",
                  label: "Буинск",
                },
                {
                  id: "Елабуга",
                  label: "Елабуга",
                },
                {
                  id: "Заинск",
                  label: "Заинск",
                },
                {
                  id: "Зеленодольск",
                  label: "Зеленодольск",
                },
                {
                  id: "Иннополис",
                  label: "Иннополис",
                },
                {
                  id: "Казань",
                  label: "Казань",
                },
                {
                  id: "Кукмор",
                  label: "Кукмор",
                },
                {
                  id: "Лаишево",
                  label: "Лаишево",
                },
                {
                  id: "Лениногорск",
                  label: "Лениногорск",
                },
                {
                  id: "Мамадыш",
                  label: "Мамадыш",
                },
                {
                  id: "Менделеевск",
                  label: "Менделеевск",
                },
                {
                  id: "Мензелинск",
                  label: "Мензелинск",
                },
                {
                  id: "Набережные Челны",
                  label: "Набережные Челны",
                },
                {
                  id: "Нижнекамск",
                  label: "Нижнекамск",
                },
                {
                  id: "Нурлат",
                  label: "Нурлат",
                },
                {
                  id: "Тетюши",
                  label: "Тетюши",
                },
                {
                  id: "Чистополь",
                  label: "Чистополь",
                },
              ],
            },
            {
              id: "Тверская область",
              label: "Тверская область",

              children: [
                {
                  id: "Андреаполь",
                  label: "Андреаполь",
                },
                {
                  id: "Бежецк",
                  label: "Бежецк",
                },
                {
                  id: "Белый",
                  label: "Белый",
                },
                {
                  id: "Бологое",
                  label: "Бологое",
                },
                {
                  id: "Весьегонск",
                  label: "Весьегонск",
                },
                {
                  id: "Вышний Волочёк",
                  label: "Вышний Волочёк",
                },
                {
                  id: "Западная Двина",
                  label: "Западная Двина",
                },
                {
                  id: "Зубцов",
                  label: "Зубцов",
                },
                {
                  id: "Калязин",
                  label: "Калязин",
                },
                {
                  id: "Кашин",
                  label: "Кашин",
                },
                {
                  id: "Кимры",
                  label: "Кимры",
                },
                {
                  id: "Конаково",
                  label: "Конаково",
                },
                {
                  id: "Красный Холм",
                  label: "Красный Холм",
                },
                {
                  id: "Кувшиново",
                  label: "Кувшиново",
                },
                {
                  id: "Лихославль",
                  label: "Лихославль",
                },
                {
                  id: "Нелидово",
                  label: "Нелидово",
                },
                {
                  id: "Осташков",
                  label: "Осташков",
                },
                {
                  id: "Ржев",
                  label: "Ржев",
                },
                {
                  id: "Старица",
                  label: "Старица",
                },
                {
                  id: "Тверь",
                  label: "Тверь",
                },
                {
                  id: "Торжок",
                  label: "Торжок",
                },
                {
                  id: "Торопец",
                  label: "Торопец",
                },
                {
                  id: "Удомля",
                  label: "Удомля",
                },
              ],
            },
            {
              id: "Томская область",
              label: "Томская область",

              children: [
                {
                  id: "Асино",
                  label: "Асино",
                },
                {
                  id: "Кедровый",
                  label: "Кедровый",
                },
                {
                  id: "Колпашево",
                  label: "Колпашево",
                },
                {
                  id: "Северск",
                  label: "Северск",
                },
                {
                  id: "Стрежевой",
                  label: "Стрежевой",
                },
                {
                  id: "Томск",
                  label: "Томск",
                },
              ],
            },
            {
              id: "Тульская область",
              label: "Тульская область",

              children: [
                {
                  id: "Алексин",
                  label: "Алексин",
                },
                {
                  id: "Белёв",
                  label: "Белёв",
                },
                {
                  id: "Богородицк",
                  label: "Богородицк",
                },
                {
                  id: "Венёв",
                  label: "Венёв",
                },
                {
                  id: "Донской",
                  label: "Донской",
                },
                {
                  id: "Кимовск",
                  label: "Кимовск",
                },
                {
                  id: "Киреевск",
                  label: "Киреевск",
                },
                {
                  id: "Липки",
                  label: "Липки",
                },
                {
                  id: "Новомосковск",
                  label: "Новомосковск",
                },
                {
                  id: "Плавск",
                  label: "Плавск",
                },
                {
                  id: "Суворов",
                  label: "Суворов",
                },
                {
                  id: "Тула",
                  label: "Тула",
                },
                {
                  id: "Узловая",
                  label: "Узловая",
                },
                {
                  id: "Чекалин",
                  label: "Чекалин",
                },
                {
                  id: "Щёкино",
                  label: "Щёкино",
                },
                {
                  id: "Ясногорск",
                  label: "Ясногорск",
                },
              ],
            },
            {
              id: "Тыва",
              label: "Тыва",

              children: [
                {
                  id: "Ак-Довурак",
                  label: "Ак-Довурак",
                },
                {
                  id: "Кызыл",
                  label: "Кызыл",
                },
                {
                  id: "Туран",
                  label: "Туран",
                },
                {
                  id: "Чадан",
                  label: "Чадан",
                },
                {
                  id: "Шагонар",
                  label: "Шагонар",
                },
              ],
            },
            {
              id: "Тюменская область",
              label: "Тюменская область",

              children: [
                {
                  id: "Заводоуковск",
                  label: "Заводоуковск",
                },
                {
                  id: "Ишим",
                  label: "Ишим",
                },
                {
                  id: "Тобольск",
                  label: "Тобольск",
                },
                {
                  id: "Тюмень",
                  label: "Тюмень",
                },
                {
                  id: "Ялуторовск",
                  label: "Ялуторовск",
                },
              ],
            },
            {
              id: "Удмуртия",
              label: "Удмуртия",

              children: [
                {
                  id: "Воткинск",
                  label: "Воткинск",
                },
                {
                  id: "Глазов",
                  label: "Глазов",
                },
                {
                  id: "ТИжевск",
                  label: "Ижевск",
                },
                {
                  id: "Камбарка",
                  label: "Камбарка",
                },
                {
                  id: "Можга",
                  label: "Можга",
                },
                {
                  id: "Сарапул",
                  label: "Сарапул",
                },
              ],
            },
            {
              id: "Ульяновская область",
              label: "Ульяновская область",

              children: [
                {
                  id: "Барыш",
                  label: "Барыш",
                },
                {
                  id: "Димитровград",
                  label: "Димитровград",
                },
                {
                  id: "Инза",
                  label: "Инза",
                },
                {
                  id: "Новоульяновск",
                  label: "Новоульяновск",
                },
                {
                  id: "Сенгилей",
                  label: "Сенгилей",
                },
                {
                  id: "Ульяновск",
                  label: "Ульяновск",
                },
              ],
            },
            {
              id: "Хабаровский край",
              label: "Хабаровский край",

              children: [
                {
                  id: "Амурск",
                  label: "Амурск",
                },
                {
                  id: "Бикин",
                  label: "Бикин",
                },
                {
                  id: "Вяземский",
                  label: "Вяземский",
                },
                {
                  id: "Комсомольск-на-Амуре",
                  label: "Комсомольск-на-Амуре",
                },
                {
                  id: "Николаевск-на-Амуре",
                  label: "Николаевск-на-Амуре",
                },
                {
                  id: "Советская Гавань",
                  label: "Советская Гавань",
                },
                {
                  id: "Хабаровск",
                  label: "Хабаровск",
                },
              ],
            },
            {
              id: "Хакасия",
              label: "Хакасия",

              children: [
                {
                  id: "Абаза",
                  label: "Абаза",
                },
                {
                  id: "Абакан",
                  label: "Абакан",
                },
                {
                  id: "Саяногорск",
                  label: "Саяногорск",
                },
                {
                  id: "Сорск",
                  label: "Сорск",
                },
                {
                  id: "Черногорск",
                  label: "Черногорск",
                },
              ],
            },
            {
              id: "Ханты-Мансийский АО — Югра",
              label: "Ханты-Мансийский АО — Югра",

              children: [
                {
                  id: "Белоярский",
                  label: "Белоярский",
                },
                {
                  id: "Когалым",
                  label: "Когалым",
                },
                {
                  id: "Лангепас",
                  label: "Лангепас",
                },
                {
                  id: "Лянтор",
                  label: "Лянтор",
                },
                {
                  id: "Мегион",
                  label: "Мегион",
                },
                {
                  id: "Нефтеюганск",
                  label: "Нефтеюганск",
                },
                {
                  id: "Нижневартовск",
                  label: "Нижневартовск",
                },
                {
                  id: "Нягань",
                  label: "Нягань",
                },
                {
                  id: "Покачи",
                  label: "Покачи",
                },
                {
                  id: "Пыть-Ях",
                  label: "Пыть-Ях",
                },
                {
                  id: "Радужный",
                  label: "Радужный",
                },
                {
                  id: "Сургут",
                  label: "Сургут",
                },
                {
                  id: "Урай",
                  label: "Урай",
                },
                {
                  id: "Ханты-Мансийск",
                  label: "Ханты-Мансийск",
                },
                {
                  id: "Югорск",
                  label: "Югорск",
                },
              ],
            },
            {
              id: "Чечня",
              label: "Чечня",

              children: [
                {
                  id: "Аргун",
                  label: "Аргун",
                },
                {
                  id: "Грозный",
                  label: "Грозный",
                },
                {
                  id: "Гудермес",
                  label: "Гудермес",
                },
                {
                  id: "Курчалой",
                  label: "Курчалой",
                },
                {
                  id: "Урус-Мартан",
                  label: "Урус-Мартан",
                },
                {
                  id: "Шали",
                  label: "Шали",
                },
              ],
            },
            {
              id: "Чувашия",
              label: "Чувашия",

              children: [
                {
                  id: "Алатырь",
                  label: "Алатырь",
                },
                {
                  id: "Канаш",
                  label: "Канаш",
                },
                {
                  id: "Козловка",
                  label: "Козловка",
                },
                {
                  id: "Мариинский Посад",
                  label: "Мариинский Посад",
                },
                {
                  id: "Новочебоксарск",
                  label: "Новочебоксарск",
                },
                {
                  id: "Цивильск",
                  label: "Цивильск",
                },
                {
                  id: "Чебоксары",
                  label: "Чебоксары",
                },
                {
                  id: "Шумерля",
                  label: "Шумерля",
                },
                {
                  id: "Ядрин",
                  label: "Ядрин",
                },
              ],
            },
            {
              id: "Чукотский АО",
              label: "Чукотский АО",

              children: [
                {
                  id: "Анадырь",
                  label: "Анадырь",
                },
                {
                  id: "Билибино",
                  label: "Билибино",
                },
                {
                  id: "Певек",
                  label: "Певек",
                },
              ],
            },
            {
              id: "Якутия",
              label: "Якутия",

              children: [
                {
                  id: "Алдан",
                  label: "Алдан",
                },
                {
                  id: "Верхоянск",
                  label: "Верхоянск",
                },
                {
                  id: "Вилюйск",
                  label: "Вилюйск",
                },
                {
                  id: "Ленск",
                  label: "Ленск",
                },
                {
                  id: "Мирный",
                  label: "Мирный",
                },
                {
                  id: "Нерюнгри",
                  label: "Нерюнгри",
                },
                {
                  id: "Нюрба",
                  label: "Нюрба",
                },
                {
                  id: "Олёкминск",
                  label: "Олёкминск",
                },
                {
                  id: "Покровск",
                  label: "Покровск",
                },
                {
                  id: "Среднеколымск",
                  label: "Среднеколымск",
                },
                {
                  id: "Томмот",
                  label: "Томмот",
                },
                {
                  id: "Удачный",
                  label: "Удачный",
                },
                {
                  id: "УЯкутск",
                  label: "Якутск",
                },
              ],
            },
            {
              id: "Ямало-Ненецкий АО",
              label: "Ямало-Ненецкий АО",

              children: [
                {
                  id: "Губкинский",
                  label: "Губкинский",
                },
                {
                  id: "Лабытнанги",
                  label: "Лабытнанги",
                },
                {
                  id: "Муравленко",
                  label: "Муравленко",
                },
                {
                  id: "Надым",
                  label: "Надым",
                },
                {
                  id: "Новый Уренгой",
                  label: "Новый Уренгой",
                },
                {
                  id: "Ноябрьск",
                  label: "Ноябрьск",
                },
                {
                  id: "Салехард",
                  label: "Салехард",
                },
                {
                  id: "Тарко-Сале",
                  label: "Тарко-Сале",
                },
              ],
            },
            {
              id: "Ярославская область",
              label: "Ярославская область",

              children: [
                {
                  id: "Гаврилов-Ям",
                  label: "Гаврилов-Ям",
                },
                {
                  id: "Данилов",
                  label: "Данилов",
                },
                {
                  id: "Любим",
                  label: "Любим",
                },
                {
                  id: "Мышкин",
                  label: "Мышкин",
                },
                {
                  id: "Переславль-Залесский",
                  label: "Переславль-Залесский",
                },
                {
                  id: "Пошехонье",
                  label: "Пошехонье",
                },
                {
                  id: "Ростов",
                  label: "Ростов",
                },
                {
                  id: "Рыбинск",
                  label: "Рыбинск",
                },
                {
                  id: "Тутаев",
                  label: "Тутаев",
                },
                {
                  id: "Углич",
                  label: "Углич",
                },
                {
                  id: "Ярославль",
                  label: "Ярославль",
                },
              ],
            },
            {
              id: "Челябинская область",
              label: "Челябинская область",

              children: [
                {
                  id: "Аша",
                  label: "Аша",
                },
                {
                  id: "Бакал",
                  label: "Бакал",
                },
                {
                  id: "Верхнеуральск",
                  label: "Верхнеуральск",
                },
                {
                  id: "Верхний Уфалей",
                  label: "Верхний Уфалей",
                },
                {
                  id: "Еманжелинск",
                  label: "Еманжелинск",
                },
                {
                  id: "Златоуст",
                  label: "Златоуст",
                },
                {
                  id: "Карабаш",
                  label: "Карабаш",
                },
                {
                  id: "Карталы",
                  label: "Карталы",
                },
                {
                  id: "Касли",
                  label: "Касли",
                },
                {
                  id: "Катав-Ивановск",
                  label: "Катав-Ивановск",
                },
                {
                  id: "Копейск",
                  label: "Копейск",
                },
                {
                  id: "Коркино",
                  label: "Коркино",
                },
                {
                  id: "Куса",
                  label: "Куса",
                },
                {
                  id: "Кыштым",
                  label: "Кыштым",
                },
                {
                  id: "Магнитогорск",
                  label: "Магнитогорск",
                },
                {
                  id: "Миасс",
                  label: "Миасс",
                },
                {
                  id: "Миньяр",
                  label: "Миньяр",
                },
                {
                  id: "Нязепетровск",
                  label: "Нязепетровск",
                },
                {
                  id: "Озёрск",
                  label: "Озёрск",
                },
                {
                  id: "Сатка",
                  label: "Сатка",
                },
                {
                  id: "Сим",
                  label: "Сим",
                },
                {
                  id: "Снежинск",
                  label: "Снежинск",
                },
                {
                  id: "Трёхгорный",
                  label: "Трёхгорный",
                },
                {
                  id: "Троицк",
                  label: "Троицк",
                },
                {
                  id: "Усть-Катав",
                  label: "Усть-Катав",
                },
                {
                  id: "Чебаркуль",
                  label: "Чебаркуль",
                },
                {
                  id: "Челябинск",
                  label: "Челябинск",
                },
                {
                  id: "Южноуральск",
                  label: "Южноуральск",
                },
                {
                  id: "Юрюзань",
                  label: "Юрюзань",
                },
              ],
            },
          ],
        },
        {
          id: "Армения",
          label: "Армения",

          children: [
            {
              id: "Абовян",
              label: "Абовян",
            },
            {
              id: "Агарак",
              label: "Агарак",
            },
            {
              id: "Айрум",
              label: "Айрум",
            },
            {
              id: "Алаверди",
              label: "Алаверди",
            },
            {
              id: "Апаран",
              label: "Апаран",
            },
            {
              id: "Арарат",
              label: "Арарат",
            },
            {
              id: "Армавир",
              label: "Армавир",
            },
            {
              id: "Арташат",
              label: "Арташат",
            },
            {
              id: "Артик",
              label: "Артик",
            },
            {
              id: "Ахтала",
              label: "Ахтала",
            },
            {
              id: "Аштарак",
              label: "Аштарак",
            },
            {
              id: "Берд",
              label: "Берд",
            },
            {
              id: "Бюрегаван",
              label: "Бюрегаван",
            },
            {
              id: "Вагаршапат",
              label: "Вагаршапат",
            },
            {
              id: "Вайк",
              label: "Вайк",
            },
            {
              id: "Ванадзор",
              label: "Ванадзор",
            },
            {
              id: "Варденис",
              label: "Варденис",
            },
            {
              id: "Веди",
              label: "Веди",
            },
            {
              id: "Гавар",
              label: "Гавар",
            },
            {
              id: "Горис",
              label: "Горис",
            },
            {
              id: "Гюмри",
              label: "Гюмри",
            },
            {
              id: "Дастакерт",
              label: "Дастакерт",
            },
            {
              id: "Джермук",
              label: "Джермук",
            },
            {
              id: "Дилижан",
              label: "Дилижан",
            },
            {
              id: "Егвард",
              label: "Егвард",
            },
            {
              id: "Ереван",
              label: "Ереван",
            },
            {
              id: "Ехегнадзор",
              label: "Ехегнадзор",
            },
            {
              id: "Иджеван",
              label: "Иджеван",
            },
            {
              id: "Каджаран",
              label: "Каджаран",
            },
            {
              id: "Капан",
              label: "Капан",
            },
            {
              id: "Маралик",
              label: "Маралик",
            },
            {
              id: "Мартуни",
              label: "Мартуни",
            },
            {
              id: "Масис",
              label: "Масис",
            },
            {
              id: "Мегри",
              label: "Мегри",
            },
            {
              id: "Мецамор",
              label: "Мецамор",
            },
            {
              id: "Ноемберян",
              label: "Ноемберян",
            },
            {
              id: "Нор Ачин",
              label: "Нор Ачин",
            },
            {
              id: "Раздан",
              label: "Раздан",
            },
            {
              id: "Севан",
              label: "Севан",
            },
            {
              id: "Сисиан",
              label: "Сисиан",
            },
            {
              id: "Спитак",
              label: "Спитак",
            },
            {
              id: "Степанаван",
              label: "Степанаван",
            },
            {
              id: "Талин",
              label: "Талин",
            },
            {
              id: "Ташир",
              label: "Ташир",
            },
            {
              id: "Туманян",
              label: "Туманян",
            },
            {
              id: "Цахкадзор",
              label: "Цахкадзор",
            },
            {
              id: "Чамбарак",
              label: "Чамбарак",
            },
            {
              id: "Чаренцаван",
              label: "Чаренцаван",
            },
            {
              id: "Шамлуг",
              label: "Шамлуг",
            },
          ],
        },

        {
          id: "Азербайджан",
          label: "Азербайджан",

          children: [
            {
              id: "Баку",
              label: "Баку",
            },
            {
              id: "Гянджа",
              label: "Гянджа",
            },
            {
              id: "Евлах",
              label: "Евлах",
            },
            {
              id: "Ленкорань",
              label: "Ленкорань",
            },
            {
              id: "Мингечевир",
              label: "Мингечевир",
            },
            {
              id: "Нафталан",
              label: "Нафталан",
            },
            {
              id: "Нахичевань",
              label: "Нахичевань",
            },
            {
              id: "Степанакерт",
              label: "Степанакерт",
            },
            {
              id: "Сумгаит",
              label: "Сумгаит",
            },
            {
              id: "Шеки",
              label: "Шеки",
            },
            {
              id: "Ширван",
              label: "Ширван",
            },
            {
              id: "Шуша",
              label: "Шуша",
            },
          ],
        },

        {
          id: "Беларусь",
          label: "Беларусь",
          children: [
            {
              id: "Минская область",
              label: "Минская область",

              children: [
                {
                  id: "Минск",
                  label: "Минск",
                },
                {
                  id: "Борисов",
                  label: "Борисов",
                },
                {
                  id: "Солигорск",
                  label: "Солигорск",
                },
                {
                  id: "Молодечно",
                  label: "Молодечно",
                },
                {
                  id: "Жодино",
                  label: "Жодино",
                },
                {
                  id: "Слуцк",
                  label: "Слуцк",
                },
                {
                  id: "Вилейка",
                  label: "Вилейка",
                },
                {
                  id: "Дзержинск",
                  label: "Дзержинск",
                },
                {
                  id: "Марьина Горка",
                  label: "Марьина Горкак",
                },
                {
                  id: "Столбцы",
                  label: "Столбцы",
                },
                {
                  id: "Смолевичи",
                  label: "Смолевичи",
                },
                {
                  id: "Несвиж",
                  label: "Несвиж",
                },
                {
                  id: "Заславль",
                  label: "Заславль",
                },
                {
                  id: "Фаниполь",
                  label: "Фаниполь",
                },
                {
                  id: "Березино",
                  label: "Березино",
                },
                {
                  id: "Любань",
                  label: "Любань",
                },
                {
                  id: "Старые Дороги",
                  label: "Старые Дороги",
                },
                {
                  id: "Логойск",
                  label: "Логойск",
                },
                {
                  id: "Клецк",
                  label: "Клецк",
                },
                {
                  id: "Воложин",
                  label: "Воложин",
                },
                {
                  id: "Узда",
                  label: "Узда",
                },
                {
                  id: "Червень",
                  label: "Червень",
                },
                {
                  id: "Копыль",
                  label: "Копыль",
                },
                {
                  id: "Крупки",
                  label: "Крупки",
                },
                {
                  id: "Мядель",
                  label: "Мядель",
                },
              ],
            },
            {
              id: "Витебская область",
              label: "Витебская область",

              children: [
                {
                  id: "Витебск",
                  label: "Витебск",
                },
                {
                  id: "Орша",
                  label: "Орша",
                },
                {
                  id: "Новополоцк",
                  label: "Новополоцк",
                },
                {
                  id: "Полоцк",
                  label: "Полоцк",
                },
                {
                  id: "Поставы",
                  label: "Поставы",
                },
                {
                  id: "Глубокое",
                  label: "Глубокое",
                },
                {
                  id: "Лепель",
                  label: "Лепель",
                },
                {
                  id: "Новолукомль",
                  label: "Новолукомль",
                },
                {
                  id: "Городок",
                  label: "Городок",
                },
                {
                  id: "Барань",
                  label: "Барань",
                },
                {
                  id: "Толочин",
                  label: "Толочин",
                },
                {
                  id: "Браслав",
                  label: "Браслав",
                },
                {
                  id: "Чашники",
                  label: "Чашники",
                },
                {
                  id: "Миоры",
                  label: "Миоры",
                },
                {
                  id: "Дубровно",
                  label: "Дубровно",
                },
                {
                  id: "Сенно",
                  label: "Сенно",
                },
                {
                  id: "Верхнедвинск",
                  label: "Верхнедвинск",
                },
                {
                  id: "Докшицы",
                  label: "Докшицы",
                },
                {
                  id: "Дисна",
                  label: "Дисна",
                },
              ],
            },
            {
              id: "Могилёвская область",
              label: "Могилёвская область",

              children: [
                {
                  id: "Могилёв",
                  label: "Могилёв",
                },
                {
                  id: "Бобруйск",
                  label: "Бобруйск",
                },
                {
                  id: "Горки",
                  label: "Горки",
                },
                {
                  id: "Осиповичи",
                  label: "Осиповичи",
                },
                {
                  id: "Кричев",
                  label: "Кричев",
                },
                {
                  id: "Быхов",
                  label: "Быхов",
                },
                {
                  id: "Климовичи",
                  label: "Климовичи",
                },
                {
                  id: "Шклов",
                  label: "Шклов",
                },
                {
                  id: "Костюковичи",
                  label: "Костюковичи",
                },
                {
                  id: "Чаусы",
                  label: "Чаусы",
                },
                {
                  id: "Мстиславль",
                  label: "Мстиславль",
                },
                {
                  id: "Белыничи",
                  label: "Белыничи",
                },
                {
                  id: "Кировск",
                  label: "Кировск",
                },
                {
                  id: "Чериков",
                  label: "Чериков",
                },
                {
                  id: "Славгород",
                  label: "Славгород",
                },
                {
                  id: "Круглое",
                  label: "Круглое",
                },
                {
                  id: "Кличев",
                  label: "Кличев",
                },
              ],
            },
            {
              id: "Гомельская область",
              label: "Гомельская область",

              children: [
                {
                  id: "Гомель",
                  label: "Гомель",
                },
                {
                  id: "Мозырь",
                  label: "Мозырь",
                },
                {
                  id: "Жлобин",
                  label: "Жлобин",
                },
                {
                  id: "Светлогорск",
                  label: "Светлогорск",
                },
                {
                  id: "Речица",
                  label: "Речица",
                },
                {
                  id: "Калинковичи",
                  label: "Калинковичи",
                },
                {
                  id: "Рогачёв",
                  label: "Рогачёв",
                },
                {
                  id: "Добруш",
                  label: "Добруш",
                },
                {
                  id: "Житковичи",
                  label: "Житковичи",
                },
                {
                  id: "Хойники",
                  label: "Хойники",
                },
                {
                  id: "Петриков",
                  label: "Петриков",
                },
                {
                  id: "Ельск",
                  label: "Ельск",
                },
                {
                  id: "Буда-Кошелёво",
                  label: "Буда-Кошелёво",
                },
                {
                  id: "Наровля",
                  label: "Наровля",
                },
                {
                  id: "Ветка",
                  label: "Ветка",
                },
                {
                  id: "Чечерск",
                  label: "Чечерск",
                },
                {
                  id: "Василевичи",
                  label: "Василевичи",
                },
                {
                  id: "Туров",
                  label: "Туров",
                },
              ],
            },
            {
              id: "Брестская область",
              label: "Брестская область",

              children: [
                {
                  id: "Брест",
                  label: "Брест",
                },
                {
                  id: "Барановичи",
                  label: "Барановичи",
                },
                {
                  id: "Кобрин",
                  label: "Кобрин",
                },
                {
                  id: "Берёза",
                  label: "Берёза",
                },
                {
                  id: "Лунинец",
                  label: "Лунинец",
                },
                {
                  id: "Пружаны",
                  label: "Пружаны",
                },
                {
                  id: "Иваново",
                  label: "Иваново",
                },
                {
                  id: "Дрогичин",
                  label: "Дрогичин",
                },
                {
                  id: "Ганцевичи",
                  label: "Ганцевичи",
                },
                {
                  id: "Жабинка",
                  label: "Жабинка",
                },
                {
                  id: "Микашевичи",
                  label: "Микашевичи",
                },
                {
                  id: "Белоозёрск",
                  label: "Белоозёрск",
                },
                {
                  id: "Столин",
                  label: "Столин",
                },
                {
                  id: "Малорита",
                  label: "Малорита",
                },
                {
                  id: "Ляховичи",
                  label: "Ляховичи",
                },
                {
                  id: "Каменец",
                  label: "Каменец",
                },
                {
                  id: "Давид-Городок",
                  label: "Давид-Городок",
                },
                {
                  id: "Высокое",
                  label: "Высокое",
                },
                {
                  id: "Коссово",
                  label: "Коссово",
                },
              ],
            },
            {
              id: "Гродненская область",
              label: "Гродненская область",

              children: [
                {
                  id: "Гродно",
                  label: "Гродно",
                },
                {
                  id: "Лида",
                  label: "Лида",
                },
                {
                  id: "Слоним",
                  label: "Слоним",
                },
                {
                  id: "Волковыск",
                  label: "Волковыск",
                },
                {
                  id: "Сморгонь",
                  label: "Сморгонь",
                },
                {
                  id: "Новогрудок",
                  label: "Новогрудок",
                },
                {
                  id: "Мосты",
                  label: "Мосты",
                },
                {
                  id: "Щучин",
                  label: "Щучин",
                },
                {
                  id: "Ошмяны",
                  label: "Ошмяны",
                },
                {
                  id: "Скидель",
                  label: "Скидель",
                },
                {
                  id: "Берёзовка",
                  label: "Берёзовка",
                },
                {
                  id: "Островец",
                  label: "Островец",
                },
                {
                  id: "Ивье",
                  label: "Ивье",
                },
                {
                  id: "Дятлово",
                  label: "Дятлово",
                },
                {
                  id: "Свислочь",
                  label: "Свислочь",
                },
              ],
            },
          ],
        },
        {
          id: "Казахстан",
          label: "Казахстан",
          children: [
            {
              id: "Нур-Султан",
              label: "Нур-Султан",

              children: [
                {
                  id: "Нур-Султан1",
                  label: "Нур-Султан",
                },
              ],
            },
            {
              id: "Алматы",
              label: "Алматы",

              children: [
                {
                  id: "Алматы1",
                  label: "Алматы",
                },
              ],
            },
            {
              id: "Шымкент",
              label: "Шымкент",

              children: [
                {
                  id: "Шымкент1",
                  label: "Шымкент",
                },
              ],
            },
            {
              id: "Акмолинская область",
              label: "Акмолинская область",

              children: [
                {
                  id: "Кокшетау",
                  label: "Кокшетау",
                },
              ],
            },
            {
              id: "Актюбинская область",
              label: "Актюбинская область",

              children: [
                {
                  id: "Актобе",
                  label: "Актобе",
                },
              ],
            },
            {
              id: "Алматинская область",
              label: "Алматинская область",

              children: [
                {
                  id: "Талдыкорган",
                  label: "Талдыкорган",
                },
              ],
            },
            {
              id: "Атырауская область",
              label: "Атырауская область",

              children: [
                {
                  id: "Атырау",
                  label: "Атырау",
                },
              ],
            },
            {
              id: "Восточно-Казахстанская область",
              label: "Восточно-Казахстанская область",

              children: [
                {
                  id: "Усть-Каменогорск",
                  label: "Усть-Каменогорск",
                },
              ],
            },
            {
              id: "Жамбылская область",
              label: "Жамбылская область",

              children: [
                {
                  id: "Тараз",
                  label: "Тараз",
                },
              ],
            },
            {
              id: "Западно-Казахстанская область",
              label: "Западно-Казахстанская область",

              children: [
                {
                  id: "Уральск",
                  label: "Уральск",
                },
              ],
            },
            {
              id: "Карагандинская область",
              label: "Карагандинская область",

              children: [
                {
                  id: "Караганда",
                  label: "Караганда",
                },
              ],
            },
            {
              id: "Костанайская область",
              label: "Костанайская область",

              children: [
                {
                  id: "Костанай",
                  label: "Костанай",
                },
              ],
            },
            {
              id: "Кызылординская область",
              label: "Кызылординская область",

              children: [
                {
                  id: "Кызылорда",
                  label: "Кызылорда",
                },
              ],
            },
            {
              id: "Мангистауская область",
              label: "Мангистауская область",

              children: [
                {
                  id: "Актау",
                  label: "Актау",
                },
              ],
            },
            {
              id: "Павлодарская область",
              label: "Павлодарская область",

              children: [
                {
                  id: "Павлодар",
                  label: "Павлодар",
                },
              ],
            },
            {
              id: "Северо-Казахстанская область",
              label: "Северо-Казахстанская область",

              children: [
                {
                  id: "Петропавловск",
                  label: "Петропавловск",
                },
              ],
            },
            {
              id: "Туркестанская область",
              label: "Туркестанская область",

              children: [
                {
                  id: "Туркестан",
                  label: "Туркестан",
                },
              ],
            },
          ],
        },
        {
          id: "Киргизия",
          label: "Киргизия",

          children: [
            {
              id: "Айдаркен",
              label: "Айдаркен",
            },
            {
              id: "Балыкчы",
              label: "Балыкчы",
            },
            {
              id: "Баткен",
              label: "Баткен",
            },
            {
              id: "Бишкек",
              label: "Бишкек",
            },
            {
              id: "Джалал-Абад",
              label: "Джалал-Абад",
            },
            {
              id: "Исфана",
              label: "Исфана",
            },
            {
              id: "Кадамжай",
              label: "Кадамжай",
            },
            {
              id: "Каинды",
              label: "Каинды",
            },
            {
              id: "Кант",
              label: "Кант",
            },
            {
              id: "Кара-Балта",
              label: "Кара-Балта",
            },
            {
              id: "Каракол",
              label: "Каракол",
            },
            {
              id: "Кара-Куль",
              label: "Кара-Куль",
            },
            {
              id: "Кара-Суу",
              label: "Кара-Суу",
            },
            {
              id: "Кемин",
              label: "Кемин",
            },
            {
              id: "Кербен",
              label: "Кербен",
            },
            {
              id: "Кок-Джангак",
              label: "Кок-Джангак",
            },
            {
              id: "Кочкор-Ата",
              label: "Кочкор-Ата",
            },
            {
              id: "Кызыл-Кия",
              label: "Кызыл-Кия",
            },
            {
              id: "Майлуу-Суу",
              label: "Майлуу-Суу",
            },
            {
              id: "Нарын",
              label: "Нарын",
            },
            {
              id: "Ноокат",
              label: "Ноокат",
            },
            {
              id: "Орловка",
              label: "Орловка",
            },
            {
              id: "Ош",
              label: "Ош",
            },
            {
              id: "Сулюкта",
              label: "Сулюкта",
            },
            {
              id: "Талас",
              label: "Талас",
            },
            {
              id: "Таш-Кумыр",
              label: "Таш-Кумыр",
            },
            {
              id: "Токмок",
              label: "Токмок",
            },
            {
              id: "Токтогул",
              label: "Токтогул",
            },
            {
              id: "Узген",
              label: "Узген",
            },
            {
              id: "Чолпон-Ата",
              label: "Чолпон-Ата",
            },
            {
              id: "Шопоков",
              label: "Шопоков",
            },
          ],
        },

        {
          id: "Молдова",
          label: "Молдова",

          children: [
            {
              id: "Бессарабка",
              label: "Бессарабка",
            },
            {
              id: "Бричаны",
              label: "Бричаны",
            },
            {
              id: "Глодяны",
              label: "Глодяны",
            },
            {
              id: "Дондюшаны",
              label: "Бессарабка",
            },
            {
              id: "Дрокия",
              label: "Дрокия",
            },
            {
              id: "Кочиеры",
              label: "Кочиеры",
            },
            {
              id: "Единец",
              label: "Единец",
            },
            {
              id: "Кагул",
              label: "Кагул",
            },
            {
              id: "Калараш",
              label: "Калараш",
            },
            {
              id: "Кантемир",
              label: "Кантемир",
            },
            {
              id: "Кэушень",
              label: "Кэушень",
            },
            {
              id: "Криулень",
              label: "Криулень",
            },
            {
              id: "Леова",
              label: "Леова",
            },
            {
              id: "Ниспорены",
              label: "Ниспорены",
            },
            {
              id: "Анений-Ной",
              label: "Анений-Ной",
            },
            {
              id: "Окница",
              label: "Окница",
            },
            {
              id: "Оргеев",
              label: "Оргеев",
            },
            {
              id: "Резина",
              label: "Резина",
            },
            {
              id: "Рышканы",
              label: "Рышканы",
            },
            {
              id: "Сороки",
              label: "Сороки",
            },
            {
              id: "Страшены",
              label: "Страшены",
            },
            {
              id: "Сынжерей",
              label: "Сынжерей",
            },
            {
              id: "Тараклия",
              label: "Тараклия",
            },
            {
              id: "Теленешты",
              label: "Теленешты",
            },
            {
              id: "Унгены",
              label: "Унгены",
            },
            {
              id: "Фалешты",
              label: "Фалешты",
            },
            {
              id: "Флорешты",
              label: "Флорешты",
            },
            {
              id: "Хынчешты",
              label: "Хынчешты",
            },
            {
              id: "Чимишлия",
              label: "Чимишлия",
            },
            {
              id: "Шолданешты",
              label: "Шолданешты",
            },
            {
              id: "Штефан-Водэ",
              label: "Штефан-Водэ",
            },
            {
              id: "Яловены",
              label: "Яловены",
            },
            {
              id: "Комрат",
              label: "Комрат",
            },
            {
              id: "Тирасполь",
              label: "Тирасполь",
            },
          ],
        },

        {
          id: "Таджикистан",
          label: "Таджикистан",

          children: [
            {
              id: "Бохтар",
              label: "Бохтар",
            },

            {
              id: "Бустон",
              label: "Бустон",
            },
            {
              id: "Вахдат",
              label: "Вахдат",
            },

            {
              id: "Гиссар",
              label: "Гиссар",
            },
            {
              id: "Гулистон",
              label: "Гулистон",
            },

            {
              id: "Душанбе",
              label: "Душанбе",
            },
            {
              id: "Истаравшан",
              label: "Истаравшан",
            },

            {
              id: "Истиклол",
              label: "Истиклол",
            },
            {
              id: "Исфара",
              label: "Исфара",
            },

            {
              id: "Канибадам",
              label: "Канибадам",
            },
            {
              id: "Куляб",
              label: "Куляб",
            },

            {
              id: "Леваканд",
              label: "Леваканд",
            },
            {
              id: "Нурек",
              label: "Нурек",
            },

            {
              id: "Пенджикент",
              label: "Пенджикент",
            },
            {
              id: "Рогун",
              label: "Рогун",
            },

            {
              id: "Турсунзаде",
              label: "Турсунзаде",
            },
            {
              id: "Худжанд",
              label: "Худжанд",
            },

            {
              id: "Хорог",
              label: "Хорог",
            },
          ],
        },

        {
          id: "Узбекистан",
          label: "Узбекистан",
          children: [
            {
              id: "Республика Каракалпакстан",
              label: "Республика Каракалпакстан",

              children: [
                {
                  id: "Беруни",
                  label: "Беруни",
                },
                {
                  id: "Бустан",
                  label: "Бустан",
                },
                {
                  id: "Кунград",
                  label: "Кунград",
                },
                {
                  id: "Мангит",
                  label: "Мангит",
                },
                {
                  id: "Муйнак",
                  label: "Муйнак",
                },
                {
                  id: "Нукус",
                  label: "Нукус",
                },
                {
                  id: "Тахиаташ",
                  label: "Тахиаташ",
                },
                {
                  id: "Турткуль",
                  label: "Турткуль",
                },
                {
                  id: "Халкабад",
                  label: "Халкабад",
                },
                {
                  id: "Ходжейли",
                  label: "Ходжейли",
                },
                {
                  id: "Чимбай",
                  label: "Чимбай",
                },
                {
                  id: "Шуманай",
                  label: "Шуманай",
                },
                {
                  id: "Нукус1",
                  label: "Нукус",
                },
                {
                  id: "Тахиаташ1",
                  label: "Тахиаташ",
                },
              ],
            },
            {
              id: "Андижанская область",
              label: "Андижанская область",

              children: [
                {
                  id: "Андижан",
                  label: "Андижан",
                },
                {
                  id: "Асака",
                  label: "Асака",
                },
                {
                  id: "Джалакудук",
                  label: "Джалакудук",
                },
                {
                  id: "Карасу",
                  label: "Карасу",
                },
                {
                  id: "Кургантепа",
                  label: "Кургантепа",
                },
                {
                  id: "Мархамат",
                  label: "Мархамат",
                },
                {
                  id: "Пайтуг",
                  label: "Пайтуг",
                },
                {
                  id: "Пахтаабад",
                  label: "Пахтаабад",
                },
                {
                  id: "Ханабад",
                  label: "Ханабад",
                },
                {
                  id: "Ходжаабад",
                  label: "Ходжаабад",
                },
                {
                  id: "Шахрихан",
                  label: "Шахрихан",
                },
              ],
            },
            {
              id: "Бухарская область",
              label: "Бухарская область",

              children: [
                {
                  id: "Алат",
                  label: "Алат",
                },
                {
                  id: "Бухара",
                  label: "Бухара",
                },
                {
                  id: "Вабкент",
                  label: "Вабкент",
                },
                {
                  id: "Газли",
                  label: "Газли",
                },
                {
                  id: "Галаасия",
                  label: "Галаасия",
                },
                {
                  id: "Гиждуван",
                  label: "Гиждуван",
                },
                {
                  id: "Каган",
                  label: "Каган",
                },
                {
                  id: "Каракуль",
                  label: "Каракуль",
                },
                {
                  id: "Караулбазар",
                  label: "Караулбазар",
                },
                {
                  id: "Ромитан",
                  label: "Ромитан",
                },
                {
                  id: "Шафиркан",
                  label: "Шафиркан",
                },
              ],
            },
            {
              id: "Джизакская область",
              label: "Джизакская область",

              children: [
                {
                  id: "Гагарин",
                  label: "Гагарин",
                },
                {
                  id: "Галляарал",
                  label: "Галляарал",
                },
                {
                  id: "Даштабад",
                  label: "Даштабад",
                },
                {
                  id: "Джизак",
                  label: "Джизак",
                },
                {
                  id: "Дустлик",
                  label: "Дустлик",
                },
                {
                  id: "Пахтакор",
                  label: "Пахтакор",
                },
              ],
            },
            {
              id: "Кашкадарьинская область",
              label: "Кашкадарьинская область",

              children: [
                {
                  id: "Бешкент",
                  label: "Бешкент",
                },
                {
                  id: "Гузар",
                  label: "Гузар",
                },
                {
                  id: "Камаши",
                  label: "Камаши",
                },
                {
                  id: "Карши",
                  label: "Карши",
                },
                {
                  id: "Касан",
                  label: "Касан",
                },
                {
                  id: "Китаб",
                  label: "Китаб",
                },
                {
                  id: "Мубарек",
                  label: "Мубарек",
                },
                {
                  id: "Талимарджан",
                  label: "Талимарджан",
                },
                {
                  id: "Чиракчи",
                  label: "Чиракчи",
                },
                {
                  id: "Шахрисабз",
                  label: "Шахрисабз",
                },
                {
                  id: "Яккабаг",
                  label: "Яккабаг",
                },
                {
                  id: "Янги-Нишан",
                  label: "Янги-Нишан",
                },
              ],
            },
            {
              id: "Навоийская область",
              label: "Навоийская область",

              children: [
                {
                  id: "Зарафшан",
                  label: "Зарафшан",
                },
                {
                  id: "Кызылтепа",
                  label: "Кызылтепа",
                },
                {
                  id: "Навои",
                  label: "Навои",
                },
                {
                  id: "Нурата",
                  label: "Нурата",
                },
                {
                  id: "Учкудук",
                  label: "Учкудук",
                },
                {
                  id: "Янгирабад",
                  label: "Янгирабад",
                },
              ],
            },
            {
              id: "Наманганская область",
              label: "Наманганская область",

              children: [
                {
                  id: "Касансай",
                  label: "Касансай",
                },
                {
                  id: "Наманган",
                  label: "Наманган",
                },
                {
                  id: "Пап",
                  label: "Пап",
                },
                {
                  id: "Туракурган",
                  label: "Туракурган",
                },
                {
                  id: "Учкурган",
                  label: "Учкурган",
                },
                {
                  id: "Хаккулабад",
                  label: "Хаккулабад",
                },
                {
                  id: "Чартак",
                  label: "Чартак",
                },
                {
                  id: "Чуст",
                  label: "Чуст",
                },
              ],
            },
            {
              id: "Самаркандская область",
              label: "Самаркандская область",

              children: [
                {
                  id: "Акташ",
                  label: "Акташ",
                },
                {
                  id: "Булунгур",
                  label: "Булунгур",
                },
                {
                  id: "Джамбай",
                  label: "Джамбай",
                },
                {
                  id: "Джума",
                  label: "Джума",
                },
                {
                  id: "Иштыхан",
                  label: "Иштыхан",
                },
                {
                  id: "Каттакурган",
                  label: "Каттакурган",
                },
                {
                  id: "Нурабад",
                  label: "Нурабад",
                },
                {
                  id: "Пайарык",
                  label: "Пайарык",
                },

                {
                  id: "Самарканд",
                  label: "Самарканд",
                },
                {
                  id: "Ургут",
                  label: "Ургут",
                },
                {
                  id: "Челек",
                  label: "Челек",
                },
              ],
            },
            {
              id: "Сурхандарьинская область",
              label: "Сурхандарьинская область",

              children: [
                {
                  id: "Байсун",
                  label: "Байсун",
                },
                {
                  id: "Денау",
                  label: "Денау",
                },
                {
                  id: "Джаркурган",
                  label: "Джаркурган",
                },
                {
                  id: "Кумкурган",
                  label: "Кумкурган",
                },
                {
                  id: "Термез",
                  label: "Термез",
                },
                {
                  id: "Шаргунь",
                  label: "Шаргунь",
                },
                {
                  id: "Шерабад",
                  label: "Шерабад",
                },
                {
                  id: "Шурчи",
                  label: "Шурчи",
                },
              ],
            },
            {
              id: "Ташкентская область",
              label: "Ташкентская область",

              children: [
                {
                  id: "Аккурган",
                  label: "Аккурган",
                },
                {
                  id: "Алмалык",
                  label: "Алмалык",
                },
                {
                  id: "Ангрен",
                  label: "Ангрен",
                },
                {
                  id: "Ахангаран",
                  label: "Ахангаран",
                },
                {
                  id: "Бекабад",
                  label: "Бекабад",
                },
                {
                  id: "Бука",
                  label: "Бука",
                },
                {
                  id: "Газалкент",
                  label: "Газалкент",
                },
                {
                  id: "Дустабад",
                  label: "Дустабад",
                },
                {
                  id: "Келес",
                  label: "Келес",
                },
                {
                  id: "Нурафшон",
                  label: "Нурафшон",
                },
                {
                  id: "Паркент",
                  label: "Паркент",
                },
                {
                  id: "Пскент",
                  label: "Пскент",
                },
                {
                  id: "Чиназ",
                  label: "Чиназ",
                },
                {
                  id: "Чирчик",
                  label: "Чирчик",
                },
                {
                  id: "Янгиабад",
                  label: "Янгиабад",
                },
                {
                  id: "Янгиюль",
                  label: "Янгиюль",
                },
              ],
            },
            {
              id: "Ферганская область",
              label: "Ферганская область",

              children: [
                {
                  id: "Бешарык",
                  label: "Бешарык",
                },
                {
                  id: "Коканд",
                  label: "Коканд",
                },
                {
                  id: "Кува",
                  label: "Кува",
                },
                {
                  id: "Кувасай",
                  label: "Кувасай",
                },
                {
                  id: "Маргилан",
                  label: "Маргилан",
                },
                {
                  id: "Риштан",
                  label: "Риштан",
                },
                {
                  id: "Тинчлик",
                  label: "Тинчлик",
                },
                {
                  id: "Фергана",
                  label: "Фергана",
                },
                {
                  id: "Яйпан",
                  label: "Яйпан",
                },
              ],
            },
            {
              id: "Хорезмская область",
              label: "Хорезмская область",

              children: [
                {
                  id: "Питнак",
                  label: "Питнак",
                },
                {
                  id: "Ургенч",
                  label: "Ургенч",
                },
                {
                  id: "Хива",
                  label: "Хива",
                },
              ],
            },
            {
              id: "Ташкент",
              label: "Ташкент",

              children: [
                {
                  id: "Ташкент",
                  label: "Ташкент",
                },
              ],
            },
          ],
        },

        {
          id: "Грузия",
          label: "Грузия",

          children: [
            {
              id: "Тбилиси",
              label: "Тбилиси",
            },
            {
              id: "Абаша",
              label: "Абаша",
            },
            {
              id: "Амбролаури",
              label: "Амбролаури",
            },
            {
              id: "Ахалкалаки",
              label: "Ахалкалаки",
            },
            {
              id: "Ахалцихе",
              label: "Ахалцихе",
            },
            {
              id: "Ахмета",
              label: "Ахмета",
            },
            {
              id: "Багдати",
              label: "Багдати",
            },
            {
              id: "Батуми",
              label: "Батуми",
            },
            {
              id: "Болниси",
              label: "Болниси",
            },
            {
              id: "Боржоми",
              label: "Боржоми",
            },
            {
              id: "Вале",
              label: "Вале",
            },
            {
              id: "Вани",
              label: "Вани",
            },
            {
              id: "Гардабани",
              label: "Гардабани",
            },
            {
              id: "Гори",
              label: "Гори",
            },
            {
              id: "Гурджаани",
              label: "Гурджаани",
            },
            {
              id: "Дедоплис-Цкаро",
              label: "Дедоплис-Цкаро",
            },
            {
              id: "Джвари",
              label: "Джвари",
            },
            {
              id: "Дманиси",
              label: "Дманиси",
            },
            {
              id: "Душети",
              label: "Душети",
            },
            {
              id: "Зестафони",
              label: "Зестафони",
            },
            {
              id: "Зугдиди",
              label: "Зугдиди",
            },
            {
              id: "Карели",
              label: "Карели",
            },
            {
              id: "Каспи",
              label: "Каспи",
            },
            {
              id: "Кварели",
              label: "Кварели",
            },
            {
              id: "Кобулети",
              label: "Кобулети",
            },
            {
              id: "Кутаиси",
              label: "Кутаиси",
            },
            {
              id: "Лагодехи",
              label: "Лагодехи",
            },
            {
              id: "Ланчхути",
              label: "Ланчхути",
            },
            {
              id: "Марнеули",
              label: "Марнеули",
            },
            {
              id: "Мартвили",
              label: "Мартвили",
            },
            {
              id: "Мцхета",
              label: "Мцхета",
            },
            {
              id: "Ниноцминда",
              label: "Ниноцминда",
            },
            {
              id: "Озургети",
              label: "Озургети",
            },
            {
              id: "Они",
              label: "Они",
            },
            {
              id: "Поти",
              label: "Поти",
            },
            {
              id: "Рустави",
              label: "Рустави",
            },
            {
              id: "Сагареджо",
              label: "Сагареджо",
            },
            {
              id: "Самтредиа",
              label: "Самтредиа",
            },
            {
              id: "Сачхере",
              label: "Сачхере",
            },
            {
              id: "Сенаки",
              label: "Сенаки",
            },
            {
              id: "Сигнахи",
              label: "Сигнахи",
            },
            {
              id: "Телави",
              label: "Телави",
            },
            {
              id: "Тержола",
              label: "Тержола",
            },
            {
              id: "Тетри-Цкаро",
              label: "Тетри-Цкаро",
            },
            {
              id: "Ткибули",
              label: "Ткибули",
            },
            {
              id: "Хашури",
              label: "Хашури",
            },
            {
              id: "Хоби",
              label: "Хоби",
            },
            {
              id: "Хони",
              label: "Хони",
            },
            {
              id: "Цагери",
              label: "Цагери",
            },
            {
              id: "Цаленджиха",
              label: "Цаленджиха",
            },
            {
              id: "Цалка",
              label: "Цалка",
            },
            {
              id: "Цнори",
              label: "Цнори",
            },
            {
              id: "Цхалтубо",
              label: "Цхалтубо",
            },
            {
              id: "Чиатура",
              label: "Чиатура",
            },
          ],
        },
        {
          id: "Туркменистан",
          label: "Туркменистан",

          children: [
            {
              id: "Ашхабад",
              label: "Ашхабад",
            },
            {
              id: "Акдепе",
              label: "Акдепе",
            },
            {
              id: "Аннау",
              label: "Аннау",
            },
            {
              id: "Арчман",
              label: "Арчман",
            },
            {
              id: "Бабадайхан",
              label: "Бабадайхан",
            },
            {
              id: "Байрамали",
              label: "Байрамали",
            },
            {
              id: "Балканабат",
              label: "Балканабат",
            },
            {
              id: "Бахарден",
              label: "Бахарден",
            },
            {
              id: "Берекет",
              label: "Берекет",
            },
            {
              id: "Болдумсаз",
              label: "Болдумсаз",
            },
            {
              id: "Газачак",
              label: "Газачак",
            },
            {
              id: "Гарабекевюл",
              label: "Гарабекевюл",
            },
            {
              id: "Гарабогаз",
              label: "Гарабогаз",
            },
            {
              id: "Гектепе",
              label: "Гектепе",
            },
            {
              id: "Героглы",
              label: "Героглы",
            },
            {
              id: "Губадаг",
              label: "Губадаг",
            },
            {
              id: "Гумдаг",
              label: "Гумдаг",
            },
            {
              id: "Дарганата",
              label: "Дарганата",
            },
            {
              id: "Дашогуз",
              label: "Дашогуз",
            },
            {
              id: "Достлук",
              label: "Достлук",
            },
            {
              id: "Дянев",
              label: "Дянев",
            },
            {
              id: "Йолотань",
              label: "Йолотань",
            },
            {
              id: "Каахка",
              label: "Каахка",
            },
            {
              id: "Керки",
              label: "Керки",
            },
            {
              id: "Койтендаг",
              label: "Койтендаг",
            },
            {
              id: "Куняургенч",
              label: "Куняургенч",
            },
            {
              id: "Магданлы",
              label: "Магданлы",
            },
            {
              id: "Мары",
              label: "Мары",
            },
            {
              id: "Махтумкули",
              label: "Махтумкули",
            },
            {
              id: "Мургаб",
              label: "Мургаб",
            },
            {
              id: "Ниязов",
              label: "Ниязов",
            },
            {
              id: "Сакар",
              label: "Сакар",
            },
            {
              id: "Сакарчага",
              label: "Сакарчага",
            },
            {
              id: "Саят",
              label: "Саят",
            },
            {
              id: "Сейди",
              label: "Сейди",
            },
            {
              id: "Серахс",
              label: "Серахс",
            },
            {
              id: "Сердар",
              label: "Сердар",
            },
            {
              id: "Серхетабат",
              label: "Серхетабат",
            },
            {
              id: "Теджен",
              label: "Теджен",
            },
            {
              id: "Туркменабат",
              label: "Туркменабат",
            },
            {
              id: "Туркменкала",
              label: "Туркменкала",
            },
            {
              id: "Туркменбаши",
              label: "Туркменбаши",
            },
            {
              id: "Фарап",
              label: "Фарап",
            },
            {
              id: "Хазар",
              label: "Хазар",
            },
            {
              id: "Халач",
              label: "Халач",
            },
            {
              id: "Ходжамбаз",
              label: "Ходжамбаз",
            },
            {
              id: "Шатлык",
              label: "Шатлык",
            },
            {
              id: "Эсенгулы",
              label: "Эсенгулы",
            },
            {
              id: "Этрек",
              label: "Этрек",
            },
          ],
        },
      ],
    };
  },
});
