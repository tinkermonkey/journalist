/**
 * Determine the greatest common divisor of two numbers
 * @param {*} a
 * @param {*} b
 */
function gcd (a, b) {
  if (!b) {
    return a
  }
  return gcd(b, a % b)
}

export const Util = {
  /**
   * Return a timestamp string
   */
  timestamp () {
    return moment().format('hh:mm:ss.SSS')
  },
  
  /**
   * Convert words to Title Case
   * @param words
   * @return {*}
   */
  titleCase (words) {
    return words.replace(/([A-Z])/g, ' $1').split(/[^a-z0-9]/i).map((word) => {
      return word.substr(0, 1).toUpperCase() + word.substr(1)
    }).join(' ').trim()
  },
  
  /**
   * Capitalize a string
   * @param word The string to capitalize
   */
  capitalize (word) {
    if (word) {
      return word.substr(0, 1).toUpperCase() + word.substr(1);
    }
    return word;
  },
  
  /**
   * Convert camel case to title case
   * @param word
   */
  camelToTitle (word) {
    if (word) {
      return (word.substr(0, 1).toUpperCase() + word.substr(1)).replace(/([A-Z])/g, ' $1').trim();
    }
  },
  
  /**
   * Convert camel case to dashed words
   * @param word
   */
  camelToDash (word) {
    if (word) {
      return word.replace(/([A-Z])/g, '-$1').trim().toLowerCase();
    }
  },
  
  /**
   * Convert words to a CamelCase string
   * @param words
   */
  wordsToCamel (words) {
    if (words) {
      return words.replace(/[\W]/g, ' ')
          .replace(/(^[a-z]|\s+[a-z])/g, (letter) => {
            return letter.trim().toUpperCase()
          })
          .replace(/\s/g, '');
    }
  },
  
  /**
   * Determine the greatest common divisor of two numbers
   * @param {*} a
   * @param {*} b
   */
  greatestCommonDivisor (a, b) {
    return [ a, b ].reduce(gcd)
  },
  
  /**
   * Subscribe to the standard set of data
   * @param instance
   */
  standardSubscriptions (instance) {
    instance.subscribe('active_capacity_plans');
    instance.subscribe('basic_integrations');
    instance.subscribe('contributors');
    instance.subscribe('contributor_role_definitions');
    instance.subscribe('contributor_team_roles');
    instance.subscribe('contributor_project_assignments');
    instance.subscribe('efforts');
    instance.subscribe('priorities');
    instance.subscribe('projects');
    instance.subscribe('releases');
    instance.subscribe('release_integration_links');
    instance.subscribe('status_report_settings');
    instance.subscribe('system_health_metrics');
    instance.subscribe('user_level');
    instance.subscribe('tasks');
    instance.subscribe('teams');
  },
  
  /**
   * Compile a template definition
   * @param displayTemplate {DisplayTemplate}
   */
  compileTemplate (displayTemplate) {
    let code = '(function(){' + "\n" + (displayTemplate.templatePreamble || '') + "\n" +
        'Template.' + displayTemplate.templateName + '.helpers(' + (displayTemplate.templateHelpers || '{}') + ');' + "\n" +
        'Template.' + displayTemplate.templateName + '.events(' + (displayTemplate.templateEvents || '{}') + ');' + "\n" +
        'Template.' + displayTemplate.templateName + '.onCreated(() => { ' + (displayTemplate.templateCreated || '') + '});' + "\n" +
        'Template.' + displayTemplate.templateName + '.onRendered(() => { ' + (displayTemplate.templateRendered || '') + '});' + "\n" +
        'Template.' + displayTemplate.templateName + '.onDestroyed(() => { ' + (displayTemplate.templateDestroyed || '') + '});' + "\n" +
        '})()';
    
    //console.log('compileTemplate:', displayTemplate.templateName, code);
    Template[ displayTemplate.templateName ] = new Template(displayTemplate.templateName, eval(SpacebarsCompiler.compile(displayTemplate.templateLayout, { isTemplate: true })));
    try {
      eval(code);
    } catch (e) {
      console.error('compileTemplate failed:', displayTemplate.templateName, code, e);
      throw e
    }
    return code
  },
  
  /**
   * SVG Text wrapping
   * https://bl.ocks.org/mbostock/7555321
   * @param text
   * @param d3
   * @param width
   */
  wrapSvgText (text, d3, width) {
    // getComputedTextLength seems to fairly reliably under-estimate, can't find a better option that's not slow (getBoundingClientRect)
    width = width * 0.9;
    text.each(function () {
      let text       = d3.select(this),
          words      = text.text().split(/\s+/).reverse(),
          word,
          line       = [],
          lineNumber = 0,
          lineHeight = 1.2, // ems
          y          = text.attr('y'),
          dy         = parseFloat(text.attr('dy') || 0),
          tspan      = text.text(null).append('tspan').attr('x', text.attr('x')).attr('y', y).attr('dy', dy + 'em');
      
      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(' '));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(' '));
          line  = [ word ];
          tspan = text.append('tspan').attr('x', text.attr('x')).attr('y', y)
              .attr('dy', ++lineNumber * lineHeight + dy + 'em').text(word);
        }
      }
    });
  },
  
  /**
   * Compute the number of work days between two dates
   * @param dateA
   * @param dateB
   */
  workDaysDiff (dateA, dateB) {
    let momentA    = moment(dateA),
        momentB    = moment(dateB),
        momentZero = moment(dateA).startOf('week'),
        deltaA     = momentA.diff(momentZero, 'days'),
        deltaB     = momentB.diff(momentZero, 'days');
    
    return Util.workDaysSinceWeekStart(deltaB) - Util.workDaysSinceWeekStart(deltaA)
  },
  
  /**
   * Calculate the number of work days in a day count since a week start
   * @param dayCount
   */
  workDaysSinceWeekStart (dayCount) {
    return dayCount - Math.ceil(dayCount / 7) - Math.ceil((dayCount + 1) / 7)
  }
};
