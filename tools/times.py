#!/usr/bin/env python2.7
import sys
import json
import lxml.etree

if len(sys.argv) < 3:
    sys.stderr.write("Usage: {0} show slideshow.html\n"
                     "       {0} dump slideshow.html > times.json\n"
                     "       {0} write slideshow.html < times.json > out.html\n"
                     .format(sys.argv[0]))
    sys.exit()

filename = sys.argv[2]

slide_times = []
slide_excerpts = []
doc = lxml.etree.parse(filename, lxml.etree.HTMLParser())
slides = list(doc.findall(".//*[@popcorn-slideshow]"))

for slide in slides:
    slide_times.append(int(slide.attrib["popcorn-slideshow"]))
    slide_excerpts.append("".join(slide.itertext())[:48].replace("\n", ""))

if sys.argv[1] == "show":
    for i, time in enumerate(slide_times):
        print "[%3d] t=%3d %s" % (i, slide_times[i], slide_excerpts[i])
elif sys.argv[1] == "dump":
    json.dump(slide_times, sys.stdout)
    sys.stdout.flush()
    sys.stderr.write("\n")
elif sys.argv[1] == "write":
    new_slide_times = json.load(sys.stdin)
    
    assert len(new_slide_times) == len(slide_times)
    assert isinstance(new_slide_times, list)
    
    for i, slide in enumerate(slides):
        slide.attrib["popcorn-slideshow"] = str(new_slide_times[i])
    
    sys.stdout.write(lxml.etree.tostring(doc, pretty_print=True, method="html"))
    sys.exit(0)
else:
    sys.argv("invalid command: " + sys.argv[1])
    sys.exit(1)
