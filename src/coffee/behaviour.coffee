# Namespace
root = exports ? this
ns = root.TrollsRevealed = {}


# Privates
sections = ['home', 'about', 'contact']
_ = root._


# Alternative bg debug
$('body').addClass('bg') if window.location.search.match('bg')


# Video wrapper
Video = ->

  _url = 'http://player.vimeo.com'

  _play = ->
    _window.postMessage('{"method": "play"}', _url)

  _pause = ->
    _window.postMessage('{"method": "pause"}', _url)

  if root.addEventListener
    root.addEventListener('message', _play)
  else
    root.attachEvent('onmessage', _play)

  $('#video_placeholder').replaceWith("""
    <iframe
      src="#{_url}/video/54854735?api=1"
      width="570"
      height="320"
      frameborder="0"
      webkitAllowFullScreen
      mozallowfullscreen
      allowFullScreen>
    </iframe>
  """)
  
  _window = $('iframe')[0].contentWindow

  play: _play
  pause: _pause

ns.video = new Video



# Section
Section = (name) ->

  _$el = $(".section[data-section-name='#{name}']")

  $el: _$el
  name: name
  on: @on
  off: @off
  trigger: @trigger
  active: _$el.is('.active')

  activate: ->
    _$el.addClass('active')
    @active = true
    @trigger('activated', @)

  deactivate: ->
    _$el.removeClass('active')
    @active = false
    @trigger('deactivated', @)

  get_switches: ->
    $(".section-switch[data-for='#{name}']")

_(Section.prototype).extend(root.BackboneEvents)


# Section Manager
SectionManager = ->

  _sections = []
  _active_section = null

  
  _bind_to_section_events = (section) ->
    section.on 'activated', _handle_section_activated

  _handle_section_activated = (section) ->
    _active_section = section
    _update_switches()
    ns.video.pause() if section.name != 'home'

  _get_section = (name) ->
    _(_sections).find (section) ->
      section.name == name

  _update_switches = ->
    _(_sections).each (section) ->
      method = `section.active ? 'addClass' : 'removeClass'`
      section.get_switches()[method]('active')

  _handle_section_activated = _.bind(_handle_section_activated, this)

  add_section: (name) ->
    section = new Section(name)
    _sections.push section
    _handle_section_activated(section) if section.active
    _bind_to_section_events(section)

  activate_section: (section_name) ->
    section = _get_section(section_name)
    return if !section || section == _active_section
    _active_section.deactivate()
    section.activate()

  get_sections: ->
    _sections


# Initialize
ns.sectionManager = new SectionManager
_(sections).each(ns.sectionManager.add_section)
$('.section-switch').on 'click', ->
  ns.sectionManager.activate_section($(this).data('for'))