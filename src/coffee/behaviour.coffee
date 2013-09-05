# Namespace
root = exports ? this
ns = root.TrollsRevealed = {}

# Convenience variables
_ = root._


# Alternative bg debug
$('body').addClass('nobg') if window.location.search.match('nobg')


# Video wrapper
Video = ->

  @_handle_message = _.bind @_handle_message, @
  @play            = _.bind @play, @
  @pause           = _.bind @pause, @

  @_url = 'http://player.vimeo.com'
  @_bind_event_listeners()
  @_insert_video()
  @_window = $('iframe')[0].contentWindow

  this

_.extend Video.prototype, 
    
  pause: ->
    @_window.postMessage('{"method": "pause"}', @_url)

  play: ->
    @_window.postMessage('{"method": "play"}', @_url)
  
  _bind_event_listeners: ->
    root.addEventListener('message', @_handle_message) if root.addEventListener
    root.attachEvent('onmessage', @_handle_message) if root.attachEvent

  _on_finish: ->
    $('body').removeClass('video_playing')

  _on_ready: ->
    @_window.postMessage('{"method": "addEventListener", "value": "play"}', @_url)
    @_window.postMessage('{"method": "addEventListener", "value": "pause"}', @_url)
    @_window.postMessage('{"method": "addEventListener", "value": "finish"}', @_url)
    @play()

  _on_pause: ->
    $('body').removeClass('video_playing')

  _on_play: ->
    $('body').addClass('video_playing')

  _parse_json: (json_string) ->
    return JSON.parse(json_string) if JSON && JSON.parse
    return eval("new Object(#{json_string})")

  _handle_message: (e) ->
    e = @_parse_json(e.data)
    @["_on_#{e.event}"]() if typeof @["_on_#{e.event}"] == 'function'

  _insert_video: ->
    $('#video_placeholder').replaceWith("""
      <iframe
        src="#{@_url}/video/73785345?api=1"
        width="650"
        height="365"
        frameborder="0"
        webkitAllowFullScreen
        mozallowfullscreen
        allowFullScreen>
      </iframe>
    """)


# Section
Section = (name) ->

  @name = name
  @_$el = $(".section[data-section-name='#{@name}']")
  @active = @_$el.is('.active')

_.extend Section.prototype, root.BackboneEvents,

  activate: ->
    @_$el.addClass('active')
    @active = true
    @trigger('activated', @)

  deactivate: ->
    @_$el.removeClass('active')
    @active = false
    @trigger('deactivated', @)

  get_switches: ->
    $(".section-switch[data-for='#{@name}']")



# Section Manager
SectionManager = (sections) ->

  @_handle_section_activated = _.bind @_handle_section_activated, @

  @_sections = []
  @_active_section = null
  _(sections).each(@add_section, @)

  this

_.extend SectionManager.prototype, root.BackboneEvents,

  activate_section: (section_name) ->
    section = @_get_section(section_name)
    return if !section || section == @_active_section
    @_active_section.deactivate()
    section.activate()

  add_section: (name) ->
    section = new Section(name)
    @_sections.push section
    @_handle_section_activated(section) if section.active
    @_bind_to_section_events(section)

  get_sections: ->
    @_sections

  _bind_to_section_events: (section) ->
    section.on 'activated', @_handle_section_activated

  _get_section: (name) ->
    _.find @_sections, (section) ->
      section.name == name

  _handle_section_activated: (section) ->
    previous_section = @_active_section
    @_active_section = section
    @_update_switches()
    @trigger('section_activated', @_active_section, previous_section)

  _update_switches: ->
    _(@_sections).each (section) ->
      method = `section.active ? 'addClass' : 'removeClass'`
      section.get_switches()[method]('active')


# Initialize
ns.video = new Video
ns.sectionManager = new SectionManager(['home', 'about', 'contact'])

# Bind to section switches
$('.section-switch').on 'click', ->
  ns.sectionManager.activate_section($(this).data('for'))

# Bind to section activated
ns.sectionManager.on 'section_activated', (section, previous_section) ->
  ns.video.pause() if section.name != 'home'
  $('body').removeClass(previous_section.name) if previous_section
  $('body').addClass(section.name)

