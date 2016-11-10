# apoco
## spa javascript web framework


[Online manual](https://snorkelferret.github.io)

Apoco is a data-driven enterprise level SPA library/Frontend framework. The components can be used together or individually. Apoco is arranged hierarchically.

Windows
    Windows contain
Panels
    Panels contain
displays
    displays contain
fields or nodes
    which contain
types

You don't have to use the hierarchy, any of the components can be used independently, e.g you can use the display templates without using the Panel, or fields without using displays, but you can't use displays without specifying the appropriate field(s) 

Apoco panels are generally defined in a UI_defs.js file.,
for example,

```javascript

UI.Panels={
    MyPanel:{name: 'MyPanel',
              components:[ {display: 'tabs',
                            DOM: 'Main',
                            id: 'Tabs',
                            tabs:[{name: 'someName',label: 'Some Name'},
                                  {name:'another', label:'Another'}
                                  ]
                            }
                            // add another display template here
                          ]
              }
              // add another panel here
};

```
