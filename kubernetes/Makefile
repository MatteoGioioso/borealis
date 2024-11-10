NAMESPACE ?= default

dev:
	$(MAKE) -f dev.mk setup

install:
	helm upgrade -i -n $(NAMESPACE) --create-namespace borealis ./charts/borealis