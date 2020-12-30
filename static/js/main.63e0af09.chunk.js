(this.webpackJsonp1vs1=this.webpackJsonp1vs1||[]).push([[0],{10:function(e,t,a){"use strict";a.r(t);var n=a(8),s=a(0),l=a(3),c=a(4),r=a(2),i=a(6),u=a(5),o=a(1),h=a.n(o),d=a(9),j=a.n(d),p=(a(16),"https://ancient-depths-46233.herokuapp.com/"),g="https://fantasy.premierleague.com/api",v=function(e){Object(i.a)(a,e);var t=Object(u.a)(a);function a(e){var n;return Object(l.a)(this,a),(n=t.call(this,e)).state={value:localStorage.getItem("PlayerId")},n.handleChange=n.handleChange.bind(Object(r.a)(n)),n.handleSubmit=n.handleSubmit.bind(Object(r.a)(n)),n}return Object(c.a)(a,[{key:"handleChange",value:function(e){this.setState({value:e.target.value})}},{key:"handleSubmit",value:function(e){var t=this,a="".concat(p).concat(g,"/entry/").concat(this.state.value,"/");fetch(a).then((function(e){return e.json()})).then((function(e){t.props.afterSubmit(e)})),localStorage.setItem("PlayerId",this.state.value),e.preventDefault()}},{key:"render",value:function(){return Object(s.jsxs)("form",{onSubmit:this.handleSubmit,children:[Object(s.jsxs)("label",{children:["Player ID:",Object(s.jsx)("br",{}),Object(s.jsx)("input",{type:"text",placeholder:"e.g. 2458458",value:this.state.value,onChange:this.handleChange})]}),Object(s.jsx)("input",{type:"submit",value:"Check",className:"submit-entry"})]})}}]),a}(h.a.Component);function b(e){return Object(s.jsxs)("div",{className:"entry-info",children:[e.value,Object(s.jsx)("button",{onClick:e.onChange,className:"change-entry"})]})}var f=function(e){Object(i.a)(a,e);var t=Object(u.a)(a);function a(e){var n;return Object(l.a)(this,a),(n=t.call(this,e)).state={id:-1,value:"Select a League",leagues:e.leagues},n.handleChange=n.handleChange.bind(Object(r.a)(n)),n}return Object(c.a)(a,[{key:"handleChange",value:function(e){var t=e.target.selectedIndex,a=e.target[t].getAttribute("league-id");this.setState({id:a,value:e.target.value});var s=[].concat(Object(n.a)(this.state.leagues.classic),Object(n.a)(this.state.leagues.h2h)).find((function(e){return e.id===+a}));this.props.onChange(s)}},{key:"render",value:function(){var e=this.state.leagues.classic&&this.state.leagues.classic.filter((function(e){return"x"===e.league_type})),t=this.state.leagues.h2h,a=this.state.leagues.classic.filter((function(e){return"s"===e.league_type}));return Object(s.jsx)("form",{className:"league-form",children:Object(s.jsx)("label",{children:Object(s.jsxs)("select",{value:this.state.value,onChange:this.handleChange,className:"league-select",children:[Object(s.jsx)("option",{value:"Select a League",disabled:!0,hidden:!0,children:"Select a League"}),Object(s.jsx)(y,{leagues:e,title:"Classic Leagues"}),Object(s.jsx)(y,{leagues:t,title:"Head-to-Head Leagues"}),Object(s.jsx)(y,{leagues:a,title:"Global Leagues"})]})})})}}]),a}(h.a.Component);function y(e){if(e.leagues&&e.leagues.length>0){var t=e.leagues.map((function(e){return Object(s.jsxs)("option",{"league-id":e.id,value:e.name,children:[e.entry_rank," - ",e.name]},e.id)}));return Object(s.jsx)("optgroup",{label:e.title,children:t})}return null}var m=function(e){Object(i.a)(a,e);var t=Object(u.a)(a);function a(e){var n;return Object(l.a)(this,a),(n=t.call(this,e)).state={value:"Select a player"},n.handleChange=n.handleChange.bind(Object(r.a)(n)),n}return Object(c.a)(a,[{key:"handleChange",value:function(e){this.setState({value:+e.target.value}),this.props.onChange(+e.target.value)}},{key:"render",value:function(){var e=this.props.rankings.map((function(e){return Object(s.jsx)("option",{value:e.entry,children:e.event_total?"".concat(e.entry_name," ").concat(e.total," (").concat(e.event_total,")"):"".concat(e.entry_name," ").concat(e.total," (").concat(e.matches_won,"-").concat(e.matches_drawn,"-").concat(e.matches_lost,")")},e.rank)}));return Object(s.jsxs)("select",{value:this.state.value,onChange:this.handleChange,className:"player-select",children:[Object(s.jsx)("option",{value:"Select a player",disabled:!0,hidden:!0,children:"Select a player"}),e]})}}]),a}(h.a.Component);function O(e){return Object(s.jsx)("div",{className:"points-wrapper",children:Object(s.jsx)("span",{className:"points",children:e.points})})}function k(e){var t=e.picks.map((function(e){return Object(s.jsxs)("li",{className:"player-pick",children:[Object(s.jsx)("span",{className:"player-pick-name",children:e.name}),Object(s.jsx)("span",{className:"player-pick-points",children:e.points})]},e.id)}));return Object(s.jsx)("div",{className:"player-picks-wrapper",children:Object(s.jsx)("ul",{className:"player-picks",children:t})})}var x=function(e){Object(i.a)(a,e);var t=Object(u.a)(a);function a(e){var n;return Object(l.a)(this,a),(n=t.call(this,e)).state={rankings:e.rankings,playerId:null,event:e.event,picks:null,footballPlayers:null,playersToRender:null,liveStats:null,totalPoints:0},fetch("".concat(p).concat(g,"/bootstrap-static/")).then((function(e){return e.json()})).then((function(e){n.setState({footballPlayers:e.elements})})),fetch("".concat(p).concat(g,"/event/").concat(n.state.event,"/live/")).then((function(e){return e.json()})).then((function(e){n.setState({liveStats:e.elements})})),n}return Object(c.a)(a,[{key:"handlePlayerChange",value:function(e){var t=this;this.setState({playerId:e});var a="".concat(p).concat(g,"/entry/").concat(e,"/event/").concat(this.state.event,"/picks/");fetch(a).then((function(e){return e.json()})).then((function(e){if(t.setState({picks:e.picks}),t.state.footballPlayers&&t.state.liveStats){var a=e.picks.map((function(e){var a=t.state.footballPlayers.find((function(t){return t.id===e.element})),n=t.state.liveStats.find((function(t){return t.id===e.element}));return{id:e.element,name:a.web_name,points:n.stats.total_points}}));t.setState({playersToRender:a})}if(t.state.playersToRender){var n=t.state.playersToRender.reduce((function(e,t){return e+t.points}),0);t.setState({totalPoints:n})}}))}},{key:"render",value:function(){var e=this;return Object(s.jsxs)("div",{className:"player-info",children:[this.state.rankings&&Object(s.jsx)(m,{rankings:this.state.rankings,onChange:function(t){return e.handlePlayerChange(t)}}),Object(s.jsx)(O,{points:this.state.totalPoints}),this.state.playersToRender&&Object(s.jsx)(k,{picks:this.state.playersToRender})]})}}]),a}(h.a.Component),C=function(e){Object(i.a)(a,e);var t=Object(u.a)(a);function a(e){var n;return Object(l.a)(this,a),(n=t.call(this,e)).state={playerName:null,playerInfo:null,currentEvent:null,leagues:null,selectedLeague:null,rankings:null},n}return Object(c.a)(a,[{key:"handlePlayerInfo",value:function(e){var t="".concat(e.name,", ").concat(e.player_first_name," ").concat(e.player_last_name);this.setState({playerName:t,playerInfo:e,currentEvent:e.current_event,leagues:e.leagues})}},{key:"handlePlayerChange",value:function(){this.setState({playerName:null,playerInfo:null,leagues:null})}},{key:"handleLeagueChange",value:function(e){var t=this;this.setState({selectedLeague:e});var a="c"===e.scoring?"/leagues-classic/":"/leagues-h2h/",n="".concat(p).concat(g).concat(a).concat(e.id,"/standings/");this.setState({rankings:null}),fetch(n).then((function(e){return e.json()})).then((function(e){t.setState({rankings:e.standings.results})}))}},{key:"render",value:function(){var e=this;return Object(s.jsxs)("div",{className:"app",children:[!this.state.playerName&&Object(s.jsx)(v,{afterSubmit:function(t){return e.handlePlayerInfo(t)}}),this.state.playerName&&Object(s.jsx)(b,{value:this.state.playerName,onChange:function(){return e.handlePlayerChange()}}),this.state.leagues&&Object(s.jsx)(f,{leagues:this.state.leagues,onChange:function(t){return e.handleLeagueChange(t)}}),Object(s.jsxs)("div",{className:"players-info",children:[this.state.rankings&&Object(s.jsx)(x,{rankings:this.state.rankings,event:this.state.currentEvent}),this.state.rankings&&Object(s.jsx)(x,{rankings:this.state.rankings,event:this.state.currentEvent})]})]})}}]),a}(h.a.Component);j.a.render(Object(s.jsx)(C,{}),document.getElementById("root"))},16:function(e,t,a){}},[[10,1,2]]]);
//# sourceMappingURL=main.63e0af09.chunk.js.map