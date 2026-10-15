# Emscripten (WebAssembly) build of LBreakout2.
#
# Usage (from the top-level source directory):
#   source /path/to/emsdk/emsdk_env.sh
#   make -f emscripten/Makefile            # -> build-web/index.html (+ .js/.wasm/.data)
#   make -f emscripten/Makefile serve      # local test server on :8080
#
# Uses the SDL2, SDL2_mixer and libpng ports shipped with Emscripten.

CC       = emcc
OUT      = build-web
OBJDIR   = $(OUT)/obj
VERSION  = 2.6.5

# virtual filesystem layout inside the browser
DATA_DIR = /data
# SAVE_DIR is mounted as IDBFS (persistent), see pre.js
SAVE_DIR = /home/web_user/.lgames

PORTS    = -sUSE_SDL=2 -sUSE_SDL_MIXER=2 -sSDL2_MIXER_FORMATS=[] \
           -sUSE_LIBPNG=1 -sUSE_ZLIB=1

DEFS     = -DVERSION=\"$(VERSION)\" -DPACKAGE=\"lbreakout2\" \
           -DSRC_DIR=\"$(DATA_DIR)\" -DHI_DIR=\"$(SAVE_DIR)\" \
           -DAUDIO_ENABLED -DWITH_SOUND

CFLAGS  ?= -O2
ALL_CFLAGS = $(PORTS) $(DEFS) $(CFLAGS) -Wall -Wno-pointer-sign -Wno-unused-but-set-variable \
           -Wno-unused-variable -Wno-parentheses -Wno-dangling-else \
           -Wno-invalid-source-encoding

ALL_LDFLAGS = $(PORTS) -O2 $(LDFLAGS) \
           -sASYNCIFY -sASYNCIFY_STACK_SIZE=262144 \
           -sALLOW_MEMORY_GROWTH=1 -sINITIAL_MEMORY=64MB \
           -sSTACK_SIZE=1MB \
           -sEXIT_RUNTIME=1 \
           -sENVIRONMENT=web \
           -sFORCE_FILESYSTEM=1 \
           -lidbfs.js \
           -sEXPORTED_FUNCTIONS=_main,_web_save_state \
           -sEXPORTED_RUNTIME_METHODS=FS \
           --pre-js emscripten/pre.js \
           --shell-file emscripten/shell.html \
           --preload-file client/gfx@$(DATA_DIR)/gfx \
           --preload-file client/sounds@$(DATA_DIR)/sounds \
           --preload-file client/levels@$(DATA_DIR)/levels \
           --preload-file client/gui_theme@$(DATA_DIR)/gui_theme \
           --exclude-file '*Makefile*'

# same layout as the autotools build: three helper libraries + client
COMMON_SRCS = common/list.c common/net.c common/tools.c common/parser.c
GAME_SRCS   = game/game.c game/levels.c game/shots.c game/bricks.c \
  game/paddle.c game/extras.c game/balls.c game/mathfuncs.c game/comm.c
GUI_SRCS    = gui/list.c gui/stk.c gui/gui.c gui/gui_widget.c \
  gui/gui_theme.c gui/gui_box.c gui/gui_button.c gui/gui_label.c \
  gui/gui_icon.c gui/gui_radiogroup.c gui/gui_scrollbar.c \
  gui/gui_progressbar.c gui/gui_list.c gui/gui_edit.c gui/gui_spinbutton.c
CLIENT_SRCS = \
  client/credit.c client/shine.c client/extras.c client/balls.c \
  client/shrapnells.c client/shots.c client/event.c client/paddle.c \
  client/frame.c client/misc.c client/bricks.c client/player.c \
  client/file.c client/config.c client/setselect.c client/item.c \
  client/menu.c client/manager.c client/value.c client/chart.c \
  client/editor.c client/help.c client/hint.c client/theme.c \
  client/client.c client/client_recv.c client/client_data.c \
  client/client_handlers.c client/game.c client/comm.c client/slot.c \
  client/display.c client/main.c

obj = $(1:%.c=$(OBJDIR)/%.o)
LIBS = $(OBJDIR)/libcommon.a $(OBJDIR)/libGui.a $(OBJDIR)/libgame.a
DATA = $(shell find client/gfx client/sounds client/levels client/gui_theme -type f ! -name 'Makefile*')

all: $(OUT)/index.html

$(OUT)/index.html: $(call obj,$(CLIENT_SRCS)) $(LIBS) $(DATA) emscripten/pre.js emscripten/shell.html
	$(CC) $(call obj,$(CLIENT_SRCS)) $(LIBS) $(ALL_LDFLAGS) -o $@

$(OBJDIR)/libcommon.a: $(call obj,$(COMMON_SRCS))
$(OBJDIR)/libGui.a: $(call obj,$(GUI_SRCS))
$(OBJDIR)/libgame.a: $(call obj,$(GAME_SRCS))
$(LIBS):
	rm -f $@
	emar rcs $@ $^

$(OBJDIR)/%.o: %.c
	@mkdir -p $(dir $@)
	$(CC) $(ALL_CFLAGS) -c $< -o $@

serve: all
	cd $(OUT) && python3 -m http.server 8080

clean:
	rm -rf $(OUT)

.PHONY: all serve clean
