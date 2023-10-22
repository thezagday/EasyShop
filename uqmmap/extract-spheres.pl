#! /usr/bin/perl -w
use strict;

my(@files) = qw(
	androsyn.c
	arilou.c
	blackurq.c
	chenjesu.c
	chmmr.c
	druuge.c
	human.c
	ilwrath.c
	lastbat.c
	melnorme.c
	mmrnmhrm.c
	mycon.c
	orz.c
	pkunk.c
	probe.c
	shofixti.c
	sis_ship.c
	slylandr.c
	spathi.c
	supox.c
	syreen.c
	thradd.c
	umgah.c
	urquan.c
	utwig.c
	vux.c
	yehat.c
	zoqfot.c
);

my %name_fixes = (
	Androsyn => 'Androsynth',
	Arilou => "Arilou Lalee'lay",
	Blackurq => 'Kohr-Ah',
	Slylandr => 'Slylandro',
	Thradd => 'Thraddash',
	Urquan => 'Ur-Quan',
	Vux => 'VUX',
	Zoqfot => 'Zoq-Fot-Pik',
);

local $/;
foreach my $file (@files) {
	open IN, '<', $file or die "Unable to open($file): $!\n";
	my $body = <IN>;
	close IN;

	my($race_desc) = ($body =~ /static RACE_DESC[^{]+{(.*?)[\r\n]};/s);
	if(not defined $race_desc) {
		die "Unable to find RACE_DESC for $file\n";
	}

	my($ship) = ($race_desc =~ /{([^{}]+{[^}]+}[^}]+)}/s);
	if(not defined $ship) {
		die "Unable to find ship info for $file\n";
	}

	my(@bits) = split /\s*,\s*/, $ship;
	my($r) = ($bits[2] =~ /(\d+)/);
	my($x) = ($bits[7] =~ /(\d+)/);
	my($y) = ($bits[8] =~ /(\d+)/);
	if($bits[7] =~ /MAX_X_UNIVERSE >>/) { $x = 0; $y = 0; }

	my $name = ucfirst($file);
	$name =~ s/\.c$//;
	if(exists $name_fixes{$name}) { $name = $name_fixes{$name}; }

	printf "[ %-20s, %4d, %4d, %4d ],\n", "\"$name\"", $x, $y, $r;
}
