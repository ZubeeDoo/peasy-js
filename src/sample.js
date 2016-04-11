"use strict";

var Rule = require('./rule');
var BusinessService = require('./businessService');

var AgeRule = Rule.inherit({
  association: "age",
  params: ['birthdate'],
  onValidate: function(done) {
    if (new Date().getFullYear() - this.birthdate.getFullYear() < 50) {
      this.__invalidate("You are too young");
    }
    var time = Math.floor((Math.random() * 3000) + 1);
    setTimeout(() => done(this), time);
  }
});

var NameRule = Rule.inherit({
  association: "name",
  params: ['name'],
  onValidate: function(done) {
    if (this.name === "Aaron") {
      this.__invalidate("Name cannot be Aaron");
    }
    var time = Math.floor((Math.random() * 3000) + 1);
    setTimeout(() => done(this), time);
  }
});

var FieldRequiredRule = Rule.inherit({
  params: ['field', 'data'],
  onValidate: function(done) {
    if (!this.data[this.field]) {
      this.association = this.field;
      this.__invalidate(this.field + " is required");
    }
    var time = Math.floor((Math.random() * 3000) + 1);
    setTimeout(() => done(this), time);
  }
});

var PersonService = function(dataProxy) {
//  BusinessServiceBase.call(this, dataProxy);
  if (this instanceof PersonService) {
    BusinessService.call(this);
    this.dataProxy = dataProxy;
  } else {
    return new PersonService(dataProxy);
  }
};

PersonService.prototype = new BusinessService();
PersonService.prototype.__getRulesForInsert = function(person, context, done) {
  done([new AgeRule(person.age)
                .ifValidThenExecute(() => console.log("Age succeeded"))
                .ifInvalidThenExecute(() => console.log("Age failed"))
                .ifValidThenValidate(new NameRule(person.name)
                                          .ifValidThenExecute(() => console.log("Name succeeeded"))
                                          .ifInvalidThenExecute(() => console.log("Name failed"))
                                          .ifValidThenValidate(new FieldRequiredRule("address", person)
                                                                    .ifValidThenExecute(() => console.log("Address succeeeded"))
                                                                    .ifInvalidThenExecute(() => console.log("Address failed"))
                                                              ))]);
  //return [
    //new AgeRule(person.age).ifValidThenValidate([new NameRule(person.name), new FieldRequiredRule("address", person)]) 
  //];
  //return [new AgeRule(person.age)
                //.ifValidThenExecute(() => console.log("Age succeeded"))
                //.ifInvalidThenExecute(() => console.log("Age failed"))
                //.ifValidThenValidate([new NameRule(person.name)
                                          //.ifValidThenExecute(() => console.log("Name succeeeded"))
                                          //.ifInvalidThenExecute(() => console.log("Name failed")),
                                      //new FieldRequiredRule("address", person)
                                          //.ifValidThenExecute(() => console.log("Address succeeeded"))
                                          //.ifInvalidThenExecute(() => console.log("Address failed"))])
  //];
  //return [new AgeRule(person.age)];
                                                              //
  //done([new AgeRule(person.age).ifValidThenExecute(() => console.log("AGE GOOD")), 
        //new NameRule(person.name), 
        //new FieldRequiredRule("address", person)]);

  //done([ new NameRule(person.name).ifValidThenValidate(new FieldRequiredRule("address", person))]);
}

var PersonDataProxy = function() { }

PersonDataProxy.prototype = {
  constructor: PersonDataProxy,
  insert: function(data, done) {
    data.id = 5;
    done(data);
  }
};

var service = new PersonService(new PersonDataProxy());

var commands = [
  service.insertCommand({name: "Aarons", age: new Date('2/3/1975'), address: 'aa'}),
  service.insertCommand({name: "Aaron", age: new Date('2/3/1925'), address: 'aa'}),
  service.insertCommand({name: "Aarons", age: new Date('2/3/1925')}),
  service.insertCommand({name: "aAaron", age: new Date('2/3/1925'), address: 'aaa'})
]
.forEach(function(command) {
  command.execute((result) => {
    console.log('---------------');
    console.log(result);
  });
});

module.exports = service;