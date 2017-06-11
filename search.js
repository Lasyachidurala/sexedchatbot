var answers = require('./answers');
var stopwords = require('./stopwords');
var texttools = require('./texttools');

var makeDictionary = function(d) {
	var final = {}
	for (item in d) {
		var key = item.toLowerCase();
		var val = d[item];
		final[key] = val;
	}
	return final
}

var answerDict = makeDictionary(answers);

var countDict = function(arr) {
	var dict = {};
	for (i in arr) {
		var val = arr[i];
		if (!(val in dict)) {
			dict[val] = 0;
		}
		dict[val] += 1;
	}
	return dict;
}

var stringDistance = function(str1, str2) {

	str1 = texttools.removePunc(str1);
	str2 = texttools.removePunc(str2);
	var arr1 = str1.split(" ");
	var arr2 = str2.split(" ");
	var matches = 0;
	var dict1 = countDict(arr1);
	var dict2 = countDict(arr2);

	for (key in dict1) {
		if (key in dict2) {
			matches += Math.min(dict1[key], dict2[key]);
		}
	}
	matches = matches/(arr1.length+arr2.length);
	return matches;
}

var getCloserString = function(closestStr, newStr, text) {
	closestStr = closestStr.toLowerCase();
	newStr = newStr.toLowerCase();

	var closestScore = stringDistance(closestStr, text);
	var newScore = stringDistance(newStr, text);
	if (newScore > closestScore) {
		return newStr;
	}
	return closestStr;
}

var getClosestString = function(questions, text) {
	var closestQuestion = '';
	for (i in questions) {
		var question = questions[i];
		closestQuestion = getCloserString(closestQuestion, question, text);
	}
	return closestQuestion;
}

var getQuestionPreComment = function() {
	var commentArray = [
		"",
		"",
		"Good question!",
		"Great question!",
		"Very good question!",
		"Smart question!",
		"Hmm... Let me see.",
		"Okay, let's see.."
	];
	var comment = commentArray[Math.floor(Math.random() * commentArray.length)];
	return comment;
}

var getQuestionPostComment = function() {
	var commentArray = [
		"",
		"",
		"",
		"Make sense?",
		"\nAnything else you want to know?",
		"\nAny questions?",
		"That's pretty much it!",
		"I hope that makes sense!",
		"I hope that helps!"
	];
	var comment = commentArray[Math.floor(Math.random() * commentArray.length)];
	return comment;
}

var searchAnswers = function (userId, text) {
	var questions = Object.keys(answerDict);
	var closestQuestion = getClosestString(questions, stopwords.removeStopWords(text).join(' '));
	if (closestQuestion === '') {
		closestQuestion = getClosestString(questions, text);
		if (closestQuestion === '') {
			return '🙊\nI\'m sorry, I didn\'t understand that.\nCould you ask in another way?';
		}
		return '🙊\nI\'m sorry, I didn\'t quite understand that.\nDid you mean:\n"' + closestQuestion +'"';
	}
	console.log("RESPONSE:");
	console.log(closestQuestion);
	console.log(answerDict[closestQuestion]);

	var responseArr = [
		'"'+closestQuestion+'"\n\n🐵',
		getQuestionPreComment(),
		answerDict[closestQuestion],
		getQuestionPostComment()
	];

	return responseArr.join(" ");
}

var respond = function (user, text, cb) {
	text = texttools.cleanText(text);

	if (texttools.checkGreetings(text)) {
		cb(null);
	} else if (texttools.checkLocalResources(text)) {
		cb(text.substring(5, text.length));
	} else if (texttools.checkFave(text)) {
		cb("🙉 Aww golly gee! Thanks! 😀");
	} else if (texttools.checkThanks(text)) {
		cb("🙈 You're welcome! Happy to help! 😀");
	} else if (texttools.checkAgreement(text)) {
		cb("🙉 That's great to hear!");
	} else if (texttools.checkParting(text)) {
		cb("🐒 See you later!\nCome by any time you have questions!");
	} else {
		cb(searchAnswers(user, text));
	}
}

module.exports = {
	'respond': respond
}
