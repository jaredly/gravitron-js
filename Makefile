
build: gravitron
	@echo -n

gravitron: gravitron.rs
	@echo " >> compiling << "
	@rustc -L rust-sfml/lib gravitron.rs

